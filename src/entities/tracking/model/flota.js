import { z } from "zod"
import { numeroPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Colores con los que se distinguen las unidades en el mapa y en la lista.
 *
 * Se asignan por posición, así que una unidad conserva su color mientras la
 * flota no cambie de tamaño. Son diez: con más unidades, los colores se repiten.
 *
 * @type {Array.<string>}
 */
export const COLORES_UNIDAD = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
]

/**
 * Capacidad que se asume cuando la unidad no tiene tanque configurado.
 *
 * @type {number}
 */
export const CAPACIDAD_POR_OMISION = 200

/**
 * Color de cada estado de viaje, en la pastilla del HUD.
 *
 * @readonly
 * @enum {string}
 */
export const COLOR_ESTADO = {
  completed: "#64748b",
  "almost over": "#3b82f6",
  "in transit": "#10b981",
  "up coming": "#f59e0b",
}

/**
 * El color con el que se pinta un estado de viaje.
 *
 * @param {string} estado El estado tal como viene de la base.
 * @returns {string} El color; el azul oscuro de la marca si el estado no se reconoce.
 */
export const colorEstado = (estado) =>
  COLOR_ESTADO[String(estado ?? "").toLowerCase()] ?? "#0f172a"

/**
 * Una unidad tal como la reporta el GPS.
 *
 * Los nombres de campo son los de Wialon: `nm` es el nombre, y `pos` trae la
 * posición con `y` = latitud y `x` = longitud, al revés de lo habitual.
 */
export const esquemaUnidadGps = z.object({
  id: z.union([z.string(), z.number()]),
  nm: z.string().catch(""),
  address: z.string().optional(),
  location: z.string().optional(),
  pos: nullable(
    z.object({
      y: z.number(),
      x: z.number(),
      s: z.number().catch(0),
      c: z.number().catch(0),
      t: z.number().catch(0),
      a: z.string().optional(),
    }),
  ),
})

/**
 * Una unidad tal como la conoce IMA, con su telemetría.
 */
export const esquemaUnidadTablero = z.object({
  truck_id: nullable(z.coerce.string()),
  unidad: nullable(z.coerce.string()),
  Placa_MEX: nullable(z.coerce.string()),
  current_fuel: numeroPhp(),
  tank_capacity: numeroPhp(),
  avg_mpg: numeroPhp(),
  estimated_range: numeroPhp(),
  trip_number: nullable(z.coerce.string()),
  status: nullable(z.coerce.string()),
  current_stage_number: nullable(z.coerce.string()),
  current_origin: nullable(z.coerce.string()),
  current_destination: nullable(z.coerce.string()),
  current_stop: nullable(z.coerce.string()),
})

/**
 * Los números que aparecen en un texto.
 *
 * @param {string} texto El texto a revisar.
 * @returns {Array.<string>} Los números encontrados, en orden de aparición.
 */
const numerosEn = (texto) => String(texto ?? "").match(/\d+/g) ?? []

/**
 * Escapa lo que en una cadena tendría significado dentro de una expresión regular.
 *
 * El nombre de una unidad puede traer puntos o guiones, y sin escapar cambiarían
 * lo que la expresión busca.
 *
 * @param {string} texto El texto a escapar.
 * @returns {string} El texto listo para meterse en una expresión regular.
 */
const escaparRegex = (texto) => String(texto ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Busca en el tablero la unidad que corresponde a un GPS, por su nombre.
 *
 * El GPS y la base no llaman igual a la misma unidad: Wialon dice `IMA 01` y la
 * base dice `1`. La regla es:
 *
 * 1. Si los nombres coinciden enteros, es esa.
 * 2. Si los dos nombres traen número, **el primer número tiene que ser el mismo**.
 *    `IMA 01` es la unidad `1`, y `IMA 12 - Caja 5` no es la unidad `5` por mucho
 *    que el 5 aparezca: un número que no cuadra descarta la fila, no se sigue
 *    buscando por otro lado.
 * 3. Solo si la fila del tablero no trae ningún número se prueba a buscar su
 *    nombre como palabra suelta dentro del de Wialon.
 *
 * El paso 2 es más estricto que lo que había: antes bastaba con que el número de
 * la base apareciera en cualquier parte del nombre de Wialon, y eso le colgaba a
 * un camión la telemetría de otro.
 *
 * @param {string} nombreGps El nombre que reporta el GPS.
 * @param {Array} [unidadesTablero] Las unidades del tablero.
 * @returns {(object|null)} La unidad del tablero, o `null` si ninguna corresponde.
 */
export function emparejarUnidad(nombreGps, unidadesTablero = []) {
  const nombre = String(nombreGps ?? "").toLowerCase().trim()
  if (!nombre) return null

  const numeroGps = Number.parseInt(numerosEn(nombre)[0], 10)

  for (const unidad of unidadesTablero) {
    const cruda = unidad?.unidad ?? unidad?.Unidad ?? unidad?.UNIDAD
    if (!cruda) continue

    const texto = String(cruda).toLowerCase().trim()
    if (nombre === texto) return unidad

    const numeroBd = Number.parseInt(numerosEn(texto)[0], 10)

    if (!Number.isNaN(numeroBd)) {
      if (numeroBd === numeroGps) return unidad
      continue
    }

    const comoPalabra = new RegExp(`(^|\\s|-|_)${escaparRegex(texto)}($|\\s|-|_)`)
    if (comoPalabra.test(nombre)) return unidad
  }

  return null
}

/**
 * Textos con los que el GPS dice "no pude resolver la calle".
 *
 * Vienen en el campo de la dirección como si fueran una, así que hay que
 * reconocerlos: si no, la pantalla enseña `Unknown address` en las once unidades
 * en lugar de las coordenadas, que sí sirven para localizar el camión.
 *
 * @type {Array.<string>}
 */
const SIN_DIRECCION = ["unknown address", "n/a", "-"]

/**
 * Indica si lo que llegó es una dirección de verdad.
 *
 * @param {*} texto Lo que vino en el campo.
 * @returns {boolean} `true` si se puede mostrar como dirección.
 */
const esDireccionReal = (texto) =>
  Boolean(texto) && !SIN_DIRECCION.includes(String(texto).trim().toLowerCase())

/**
 * La dirección que se muestra de una unidad.
 *
 * El GPS no siempre resuelve la calle. Cuando no la trae —o cuando manda un
 * marcador de que no pudo—, es mejor enseñar las coordenadas que un texto
 * inútil: con ellas se puede buscar el punto a mano.
 *
 * @param {object} unidadGps La unidad como la reporta el GPS.
 * @returns {string} La dirección, las coordenadas, o un aviso de que sigue resolviéndose.
 */
export function direccionDeUnidad(unidadGps) {
  const { address, location, pos } = unidadGps ?? {}
  if (esDireccionReal(address)) return address
  if (esDireccionReal(location)) return location
  if (esDireccionReal(pos?.a)) return pos.a
  if (pos) return `Coordenadas: ${pos.y}, ${pos.x}`
  return "Dirección satelital resolviendo..."
}

/**
 * Una unidad de la flota, ya con GPS y telemetría juntos.
 *
 * @typedef {object} UnidadFlota
 * @property {(string|number)} id Identificador del GPS.
 * @property {string} name Nombre que reporta el GPS.
 * @property {number} lat Latitud.
 * @property {number} lon Longitud.
 * @property {number} speed Velocidad en km/h.
 * @property {number} heading Rumbo en grados.
 * @property {number} timestamp Momento del último reporte, en segundos.
 * @property {string} address Dónde está.
 * @property {string} color Color asignado.
 * @property {(string|null)} truck_id Camión en la base, o `null` si no está dado de alta.
 * @property {string} unidad Número de unidad.
 * @property {string} placa Placa mexicana.
 * @property {string} status Estado del viaje en curso.
 * @property {(string|null)} trip_number Viaje en curso.
 * @property {number} current_fuel Galones en el tanque.
 * @property {number} tank_capacity Capacidad del tanque.
 * @property {number} avg_mpg Rendimiento promedio.
 * @property {number} estimated_range Alcance estimado en millas.
 */

/**
 * Junta lo que dice el GPS con lo que sabe IMA de cada unidad.
 *
 * Manda el GPS: si una unidad no está en el tablero se muestra igual, sin
 * telemetría, porque en el mapa sigue siendo un camión moviéndose. Al revés no:
 * una unidad de la base sin GPS no tiene dónde dibujarse.
 *
 * @param {Array} [unidadesGps] Lo que devolvió el GPS.
 * @param {Array} [unidadesTablero] Lo que devolvió el tablero.
 * @returns {Array.<UnidadFlota>} La flota lista para pintar.
 */
export function combinarFlota(unidadesGps = [], unidadesTablero = []) {
  return (Array.isArray(unidadesGps) ? unidadesGps : []).map((gps, indice) => {
    const bd = emparejarUnidad(gps?.nm, unidadesTablero) ?? {}
    const numeroEnNombre = numerosEn(gps?.nm)[0]

    return {
      id: gps?.id,
      name: gps?.nm ?? "",
      lat: gps?.pos?.y,
      lon: gps?.pos?.x,
      speed: gps?.pos?.s || 0,
      heading: gps?.pos?.c || 0,
      timestamp: gps?.pos?.t,
      address: direccionDeUnidad(gps),
      color: COLORES_UNIDAD[indice % COLORES_UNIDAD.length],
      truck_id: bd.truck_id ?? bd.Truck_id ?? bd.id_truck ?? null,
      unidad: bd.unidad ?? bd.Unidad ?? bd.UNIDAD ?? numeroEnNombre ?? "N/A",
      placa: bd.Placa_MEX ?? "N/A",
      status: bd.status ?? "Sin Estado",
      trip_number: bd.trip_number ?? null,
      current_fuel: Number(bd.current_fuel ?? 0),
      tank_capacity: Number(bd.tank_capacity ?? CAPACIDAD_POR_OMISION),
      avg_mpg: Number(bd.avg_mpg ?? 0),
      estimated_range: Number(bd.estimated_range ?? 0),
      current_stage_number: bd.current_stage_number ?? null,
      current_origin: bd.current_origin ?? null,
      current_destination: bd.current_destination ?? null,
      current_stop: bd.current_stop ?? null,
    }
  })
}

/**
 * Qué tan lleno está el tanque, en porcentaje.
 *
 * Se acota a 100 porque en producción hay lecturas imposibles —una unidad con
 * 850 galones en un tanque de 270— y sin acotar la barra se sale del cuadro y el
 * indicador circular se dibuja dando vueltas.
 *
 * @param {number} galones Lo que hay en el tanque.
 * @param {number} capacidad Lo que cabe.
 * @returns {number} Un porcentaje entre 0 y 100.
 */
export function porcentajeTanque(galones, capacidad) {
  const cabe = Number(capacidad)
  if (!cabe || cabe <= 0) return 0
  return Math.max(0, Math.min(100, (Number(galones ?? 0) / cabe) * 100))
}

/**
 * Indica si la lectura del tanque es imposible.
 *
 * Un tanque no puede tener más de lo que le cabe. Cuando pasa, el dato de origen
 * está mal y conviene decirlo en vez de pintar una barra llena como si nada.
 *
 * @param {object} unidad La unidad a revisar.
 * @returns {boolean} `true` si hay más galones que capacidad.
 */
export const lecturaTanqueSospechosa = (unidad) =>
  Number(unidad?.tank_capacity) > 0 && Number(unidad?.current_fuel) > Number(unidad?.tank_capacity)

/**
 * Filtra la flota por nombre, como escribe la persona.
 *
 * @param {Array} [flota] Las unidades.
 * @param {string} [busqueda] Lo que se escribió.
 * @returns {Array} Las unidades que coinciden.
 */
export function filtrarFlota(flota = [], busqueda = "") {
  const texto = String(busqueda ?? "").toLowerCase().trim()
  if (!texto) return flota
  return flota.filter((unidad) => String(unidad?.name ?? "").toLowerCase().includes(texto))
}

/**
 * Valida las unidades del GPS descartando lo que no cumple.
 *
 * Una unidad sin posición no se puede dibujar, así que se descarta con aviso en
 * vez de reventar el mapa.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{unidades: Array, descartadas: number}} Las válidas y cuántas se cayeron.
 */
export function normalizarUnidadesGps(filas = []) {
  const unidades = []
  let descartadas = 0

  for (const fila of Array.isArray(filas) ? filas : []) {
    const resultado = esquemaUnidadGps.safeParse(fila)
    if (resultado.success && resultado.data.pos) unidades.push(resultado.data)
    else descartadas += 1
  }

  return { unidades, descartadas }
}
