/**
 * Modos en que se puede colocar el segundo punto de una ruta.
 *
 * @readonly
 * @enum {string}
 */
export const MODO_PING = {
  BUSQUEDA: "search",
  MAPA: "map",
  CAMION: "truck",
}

/**
 * Cuánto se espera antes de buscar una dirección mientras se escribe.
 *
 * Nominatim pide no más de una petición por segundo por cliente; medio segundo
 * de espera basta para no dispararle una por tecla.
 *
 * @type {number}
 */
export const ESPERA_BUSQUEDA_MS = 500

/**
 * Un punto de la ruta, como lo entienden el mapa y el trazador.
 *
 * @typedef {object} PuntoRuta
 * @property {number} lat Latitud.
 * @property {number} lon Longitud.
 * @property {string} name Cómo se llama el punto en pantalla.
 * @property {(string|number)} [id] Id de la unidad, si el punto es un camión.
 */

/**
 * Convierte un clic en el mapa en un punto de ruta.
 *
 * @param {object} latlng El punto que reportó Leaflet, con `lat` y `lng`.
 * @returns {PuntoRuta} El punto, nombrado por sus coordenadas.
 */
export const puntoDesdeMapa = (latlng) => ({
  lat: latlng.lat,
  lon: latlng.lng,
  name: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
})

/**
 * Convierte un resultado de búsqueda en un punto de ruta.
 *
 * Los nombres de Nominatim son direcciones completas que desbordan el panel, así
 * que se recortan.
 *
 * @param {object} resultado Un resultado de la búsqueda de lugares.
 * @param {number} [largoMaximo=70] Cuántos caracteres caben en el panel.
 * @returns {PuntoRuta} El punto.
 */
export function puntoDesdeBusqueda(resultado, largoMaximo = 70) {
  const nombre = String(resultado?.display_name ?? "")
  return {
    lat: Number.parseFloat(resultado?.lat),
    lon: Number.parseFloat(resultado?.lon),
    name: nombre.length > largoMaximo ? `${nombre.substring(0, largoMaximo)}…` : nombre,
  }
}

/**
 * Convierte una unidad de la flota en un punto de ruta.
 *
 * @param {object} unidad La unidad seleccionada.
 * @returns {PuntoRuta} El punto, con el id para reconocerlo después.
 */
export const puntoDesdeUnidad = (unidad) => ({
  id: unidad?.id,
  lat: unidad?.lat,
  lon: unidad?.lon,
  name: unidad?.name ?? "",
})

/**
 * Las coordenadas de una ruta, en el orden que espera Leaflet.
 *
 * GeoJSON las da como `[longitud, latitud]` y Leaflet las quiere al revés. Es
 * el error clásico: sin voltearlas la ruta aparece en el otro hemisferio.
 *
 * @param {object} ruta La ruta que devolvió el servicio.
 * @returns {Array.<Array.<number>>} Las coordenadas como `[lat, lon]`.
 */
export function coordenadasDeRuta(ruta) {
  const puntos = ruta?.geometry?.coordinates
  if (!Array.isArray(puntos)) return []
  return puntos.map(([lon, lat]) => [lat, lon])
}

/**
 * El resumen de una ruta, en las unidades en que se lee.
 *
 * El servicio contesta en metros y segundos; en pantalla se leen kilómetros y
 * minutos.
 *
 * @param {object} ruta La ruta que devolvió el servicio.
 * @returns {{distancia: string, duracion: number}} Kilómetros con un decimal y minutos enteros.
 */
export function resumenRuta(ruta) {
  return {
    distancia: (Number(ruta?.distance ?? 0) / 1000).toFixed(1),
    duracion: Math.round(Number(ruta?.duration ?? 0) / 60),
  }
}
