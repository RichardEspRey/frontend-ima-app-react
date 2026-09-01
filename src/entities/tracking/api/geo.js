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
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.texto Lo que se escribió.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los lugares encontrados, o `[]` si no hay ninguno.
 */
export async function buscarLugares({ texto, signal }) {
  const consulta = String(texto ?? "").trim()
  if (!consulta) return []

  const url =
    `${SERVICIO_LUGARES}/search?format=json` +
    `&q=${encodeURIComponent(consulta)}&limit=${MAXIMO_LUGARES}&accept-language=es`

  const respuesta = await fetch(url, { signal })
  if (!respuesta.ok) return []

  const datos = await respuesta.json()
  return Array.isArray(datos) ? datos : []
}

/**
 * Traza la ruta por carretera entre dos puntos.
 *
 * @param {object} parametros Los extremos de la ruta.
 * @param {object} parametros.desde Punto de partida, con `lat` y `lon`.
 * @param {object} parametros.hasta Punto de llegada, con `lat` y `lon`.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<{coordenadas: Array, resumen: object}>} El trazo y su distancia y duración.
 * @throws {Error} Si el servicio no responde o no encuentra ruta entre los puntos.
 */
export async function trazarRuta({ desde, hasta, signal }) {
  const url =
    `${SERVICIO_RUTAS}/route/v1/driving/` +
    `${desde.lon},${desde.lat};${hasta.lon},${hasta.lat}` +
    `?overview=full&geometries=geojson`

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
