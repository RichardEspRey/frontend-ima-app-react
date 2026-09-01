import { useMutation } from "@tanstack/react-query"
import { coordenadasDeRuta, resumenRuta } from "../model/ruta"

/**
 * Servicio público de rutas por carretera.
 *
 * Es la instancia de demostración de OSRM: gratuita, sin llave, y sin ninguna
 * garantía de disponibilidad. Si el trazador deja de funcionar, empieza por
 * comprobar que este servicio siga en pie.
 *
 * @type {string}
 */
export const SERVICIO_RUTAS = "https://router.project-osrm.org"

/**
 * Servicio público de búsqueda de lugares.
 *
 * @type {string}
 */
export const SERVICIO_LUGARES = "https://nominatim.openstreetmap.org"

/**
 * Cuántos lugares se ofrecen al escribir una dirección.
 *
 * @type {number}
 */
export const MAXIMO_LUGARES = 5

/**
 * Busca lugares por su nombre o dirección.
 *
 * Con `conDetalles` el servicio devuelve además ciudad, estado y país por
 * separado, que es lo que permite enseñar un nombre corto en vez de la
 * dirección completa de cuarenta caracteres.
 *
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.texto Lo que se escribió.
 * @param {number} [parametros.limite] Cuántos resultados pedir.
 * @param {boolean} [parametros.conDetalles] Si se piden los componentes de la dirección.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los lugares encontrados, o `[]` si no hay ninguno.
 */
export async function buscarLugares({ texto, limite = MAXIMO_LUGARES, conDetalles, signal }) {
  const consulta = String(texto ?? "").trim()
  if (!consulta) return []

  const url =
    `${SERVICIO_LUGARES}/search?format=json` +
    `&q=${encodeURIComponent(consulta)}&limit=${limite}&accept-language=es` +
    (conDetalles ? "&addressdetails=1" : "")

  const respuesta = await fetch(url, { signal })
  if (!respuesta.ok) return []

  const datos = await respuesta.json()
  return Array.isArray(datos) ? datos : []
}

/**
 * El primer lugar que coincide con lo escrito.
 *
 * Es lo que se usa al calcular una ruta con ubicaciones que se escribieron pero
 * no se eligieron de la lista.
 *
 * @param {string} texto Lo que se escribió.
 * @returns {Promise.<{lat: number, lon: number}>} Dónde está.
 * @throws {Error} Si no se encuentra el lugar.
 */
export async function ubicarLugar(texto) {
  const [primero] = await buscarLugares({ texto, limite: 1 })
  if (!primero) throw new Error(`No se encontró: "${texto}"`)
  return { lat: Number.parseFloat(primero.lat), lon: Number.parseFloat(primero.lon) }
}

/**
 * El nombre corto de un lugar: ciudad, estado y país.
 *
 * La dirección completa que devuelve el servicio no cabe en un campo y no dice
 * más de lo que hace falta para cotizar.
 *
 * @param {object} lugar Un resultado de la búsqueda con detalles.
 * @returns {string} El nombre corto, o el completo si no hay detalles.
 */
export function nombreCortoDeLugar(lugar) {
  const direccion = lugar?.address ?? {}
  const ciudad = direccion.city || direccion.town || direccion.village || direccion.county

  const corto = [ciudad, direccion.state, direccion.country].filter(Boolean).join(", ")
  return corto || lugar?.display_name || ""
}

/**
 * Traza la ruta por carretera entre dos puntos, con las paradas de en medio.
 *
 * El servicio calcula la ruta pasando por todos los puntos en el orden en que
 * se le dan, así que las paradas van entre el origen y el destino: la ruta a
 * tres ciudades no es la suma de dos rutas sueltas.
 *
 * @param {object} parametros Los extremos de la ruta.
 * @param {object} parametros.desde Punto de partida, con `lat` y `lon`.
 * @param {object} parametros.hasta Punto de llegada, con `lat` y `lon`.
 * @param {Array} [parametros.intermedios] Paradas entre los dos, en orden.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<{coordenadas: Array, resumen: object}>} El trazo y su distancia y duración.
 * @throws {Error} Si el servicio no responde o no encuentra ruta entre los puntos.
 */
export async function trazarRuta({ desde, hasta, intermedios = [], signal }) {
  const puntos = [desde, ...intermedios, hasta]
    .map((punto) => `${punto.lon},${punto.lat}`)
    .join(";")

  const url = `${SERVICIO_RUTAS}/route/v1/driving/${puntos}?overview=full&geometries=geojson`

  let datos
  try {
    const respuesta = await fetch(url, { signal })
    datos = await respuesta.json()
  } catch (fallo) {
    throw new Error("No se pudo conectar al servicio de rutas.", { cause: fallo })
  }

  const ruta = datos?.code === "Ok" ? datos.routes?.[0] : null
  if (!ruta) throw new Error("No se encontró ruta entre los puntos.")

  return { coordenadas: coordenadasDeRuta(ruta), resumen: resumenRuta(ruta) }
}

/**
 * Traza una ruta entre dos puntos.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useTrazarRuta() {
  return useMutation({ mutationFn: trazarRuta })
}
