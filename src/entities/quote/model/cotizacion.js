/**
 * Una ubicación de la cotización: lo que se escribió y dónde cayó en el mapa.
 *
 * @typedef {object} Ubicacion
 * @property {string} input Lo que la persona escribió.
 * @property {({lat: number, lon: number}|null)} geo Dónde está, si ya se resolvió.
 */

/**
 * Una ubicación vacía, la que abre cada campo.
 *
 * @returns {Ubicacion} La ubicación en blanco.
 */
export const ubicacionVacia = () => ({ input: "", geo: null })

/**
 * Convierte a número lo que la API manda como texto.
 *
 * @param {*} valor Lo que vino.
 * @returns {(number|null)} El número, o `null` si no lo es.
 */
const numeroONulo = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null
  const numero = Number.parseFloat(valor)
  return Number.isNaN(numero) ? null : numero
}

/**
 * Arma una ubicación a partir de las columnas planas que devuelve la base.
 *
 * @param {string} nombre Lo que se escribió.
 * @param {*} lat Latitud.
 * @param {*} lon Longitud.
 * @returns {Ubicacion} La ubicación.
 */
function ubicacionDesdeApi(nombre, lat, lon) {
  const latitud = numeroONulo(lat)
  const longitud = numeroONulo(lon)

  return {
    input: nombre ?? "",
    geo: latitud === null || longitud === null ? null : { lat: latitud, lon: longitud },
  }
}

/**
 * Convierte una cotización guardada al estado que maneja la pantalla.
 *
 * La base la guarda plana —una columna por coordenada— y la pantalla trabaja
 * con ubicaciones.
 *
 * @param {object} fila La cotización tal como vino de la API.
 * @returns {object} La cotización lista para cargarse en el formulario.
 */
export function cotizacionDesdeApi(fila) {
  return {
    id: fila?.id,
    nombre: fila?.nombre,
    guardadaEn: fila?.guardado_en,
    tarifa: fila?.tarifa ?? "",
    millas: fila?.millas_total ?? "",
    rate: fila?.rate ?? "",
    origen: ubicacionDesdeApi(fila?.origen_nombre, fila?.origen_lat, fila?.origen_lon),
    destino: ubicacionDesdeApi(fila?.destino_nombre, fila?.destino_lat, fila?.destino_lon),
    origenCamion: fila?.origen_camion_nombre
      ? ubicacionDesdeApi(
          fila.origen_camion_nombre,
          fila.origen_camion_lat,
          fila.origen_camion_lon,
        )
      : ubicacionVacia(),
    paradas: (fila?.paradas ?? []).map((parada) =>
      ubicacionDesdeApi(parada?.nombre, parada?.lat, parada?.lon),
    ),
    millasViaje: numeroONulo(fila?.millas_viaje),
    millasVacias: numeroONulo(fila?.millas_vacias),
  }
}

/**
 * Los campos con los que se guarda una cotización.
 *
 * @param {object} cotizacion El estado de la pantalla.
 * @returns {object} Los campos para la API.
 */
export function cotizacionParaGuardar(cotizacion) {
  const { nombre, origen, destino, origenCamion, paradas = [] } = cotizacion

  return {
    nombre,
    origen_nombre: origen?.input ?? "",
    origen_lat: origen?.geo?.lat ?? "",
    origen_lon: origen?.geo?.lon ?? "",
    destino_nombre: destino?.input ?? "",
    destino_lat: destino?.geo?.lat ?? "",
    destino_lon: destino?.geo?.lon ?? "",
    origen_camion_nombre: origenCamion?.input ?? "",
    origen_camion_lat: origenCamion?.geo?.lat ?? "",
    origen_camion_lon: origenCamion?.geo?.lon ?? "",
    millas_viaje: cotizacion.millasViaje ?? "",
    millas_vacias: cotizacion.millasVacias ?? "",
    millas_total: cotizacion.millas ?? "",
    tarifa: cotizacion.tarifa ?? "",
    rate: cotizacion.rate ?? "",
    paradas_json: paradas
      .filter((parada) => parada?.input?.trim() && parada?.geo)
      .map((parada) => ({ nombre: parada.input, lat: parada.geo.lat, lon: parada.geo.lon })),
  }
}

/**
 * Las tres cifras de una cotización, que se calculan unas de otras.
 *
 * `tarifa = rate × millas`. Al tocar una, se recalcula la que se pueda con las
 * otras dos: es lo que permite cotizar entrando por donde se tenga el dato —a
 * veces se sabe el precio total y se quiere saber a cuánto sale la milla, y a
 * veces al revés—.
 *
 * @param {object} actuales Las tres cifras como están.
 * @param {string} campo Cuál se acaba de tocar: `tarifa`, `millas` o `rate`.
 * @param {string} valor Lo que se escribió.
 * @returns {{tarifa: string, millas: string, rate: string}} Las tres, ya recalculadas.
 */
export function recalcularTarifa(actuales, campo, valor) {
  const siguiente = { ...actuales, [campo]: valor }
  const numero = (texto) => (texto === "" || texto === null ? null : Number.parseFloat(texto))

  const tarifa = numero(siguiente.tarifa)
  const millas = numero(siguiente.millas)
  const rate = numero(siguiente.rate)

  if (campo === "tarifa" && tarifa !== null && millas) {
    return { ...siguiente, rate: (tarifa / millas).toFixed(4) }
  }

  if (campo === "rate" && rate !== null && millas) {
    return { ...siguiente, tarifa: (rate * millas).toFixed(2) }
  }

  if (campo === "millas" && millas) {
    if (tarifa !== null) return { ...siguiente, rate: (tarifa / millas).toFixed(4) }
    if (rate !== null) return { ...siguiente, tarifa: (rate * millas).toFixed(2) }
  }

  return siguiente
}

/**
 * Las millas totales de una cotización: las del viaje más las vacías.
 *
 * Las millas vacías son las que el camión recorre para llegar al origen de la
 * carga. Se cobran igual, así que entran en el total.
 *
 * @param {number} [millasViaje] Millas del recorrido cargado.
 * @param {number} [millasVacias] Millas hasta el origen.
 * @returns {number} El total.
 */
export const millasTotales = (millasViaje = 0, millasVacias = 0) =>
  Number(millasViaje ?? 0) + Number(millasVacias ?? 0)
