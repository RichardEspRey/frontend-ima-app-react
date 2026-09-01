import { z } from "zod"
import { idPhp, numeroPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Los dos países entre los que IMA opera.
 *
 * @readonly
 * @enum {string}
 */
export const PAIS = {
  MEXICO: "MX",
  USA: "US",
}

/**
 * El país contrario al dado.
 *
 * Un viaje transnacional continúa uno del otro lado de la frontera, así que para
 * buscar su pareja hay que consultar el país opuesto.
 *
 * @param {string} pais Un valor de `PAIS`.
 * @returns {string} El otro país.
 */
export const paisOpuesto = (pais) => (pais === PAIS.MEXICO ? PAIS.USA : PAIS.MEXICO)

/**
 * Un viaje transnacional: la parte de un cruce que ocurre en un país.
 *
 * `transnational_number` es lo que enlaza las dos mitades, y `movement_number`
 * dice cuál es cuál dentro del cruce.
 */
export const esquemaViajeTransnacional = z.object({
  trip_id: idPhp(),
  trip_number: z.string().catch(""),
  transnational_number: nullable(z.string()),
  movement_number: nullable(numeroPhp()),
  country_code: z.string().catch(""),
  trip_year: z.string().catch(""),
})

/**
 * Un viaje transnacional ya validado.
 *
 * @typedef {object} ViajeTransnacional
 * @property {string} trip_id Identificador.
 * @property {string} trip_number Número del viaje dentro de su país.
 * @property {(string|null)} transnational_number Número que enlaza las dos mitades.
 * @property {(number|null)} movement_number Cuál de las mitades es.
 * @property {string} country_code País donde ocurre.
 * @property {string} trip_year Año fiscal, a dos dígitos.
 */

/**
 * Arma el número visible de un viaje.
 *
 * El formato es `<número>-<país>-<año>`, que es como la gente lo reconoce en toda
 * la app: `197-US-26`.
 *
 * @param {object} datos Los datos del viaje.
 * @param {(string|number)} datos.numero Número dentro del país.
 * @param {string} datos.pais Un valor de `PAIS`.
 * @param {(string|number)} datos.anio Año a dos dígitos.
 * @returns {string} El número formateado.
 */
export const formatearNumeroViaje = ({ numero, pais, anio }) =>
  `${numero ?? ""}-${pais ?? ""}-${anio ?? ""}`

/**
 * El año a dos dígitos, que es el formato que usa la API.
 *
 * @param {(Date|number|string)} [fecha] Fecha o año; por omisión, hoy.
 * @returns {string} Los dos últimos dígitos del año.
 */
export function anioDosDigitos(fecha = new Date()) {
  const anio = fecha instanceof Date ? fecha.getFullYear() : Number(fecha)
  return String(anio).slice(-2)
}

/**
 * Agrupa los viajes transnacionales por su número de cruce.
 *
 * Sirve para ver las dos mitades juntas: un cruce completo tiene una de cada
 * país, y uno a medias tiene solo una.
 *
 * @param {Array.<ViajeTransnacional>} viajes Los viajes a agrupar.
 * @returns {Array.<{numero: string, viajes: Array}>} Los cruces.
 */
export function agruparPorCruce(viajes = []) {
  const cruces = new Map()

  for (const viaje of viajes) {
    const clave = viaje.transnational_number || "sin-cruce"
    if (!cruces.has(clave)) cruces.set(clave, [])
    cruces.get(clave).push(viaje)
  }

  return [...cruces.entries()].map(([numero, lista]) => ({ numero, viajes: lista }))
}

/**
 * Valida la lista de viajes transnacionales descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{viajes: Array.<ViajeTransnacional>, descartados: number}} Los válidos y cuántos se cayeron.
 */
export function normalizarViajesTransnacionales(filas = []) {
  const viajes = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaViajeTransnacional.safeParse(fila)
    if (resultado.success) viajes.push(resultado.data)
    else descartados += 1
  }

  return { viajes, descartados }
}

/**
 * Cómo se lista un viaje al vincular un cruce.
 *
 * El formato completo —`197-US-63T2-26`— solo se puede armar si el viaje tiene
 * número de cruce; sin él se muestra el número a secas, que es lo único que lo
 * identifica.
 *
 * @param {ViajeTransnacional} viaje El viaje a describir.
 * @returns {string} El texto de la opción.
 */
export function etiquetaViajeTransnacional(viaje) {
  const { trip_number: numero, country_code: pais, transnational_number: cruce } = viaje ?? {}
  if (!numero || !pais || !cruce) return numero || "Viaje"
  return `${numero}-${pais}-${cruce}T${viaje.movement_number}-${viaje.trip_year}`
}

/**
 * El valor con el que se identifica un viaje en el selector de cruces.
 *
 * @param {ViajeTransnacional} viaje El viaje a identificar.
 * @returns {string} Su número de cruce, o el del viaje si aún no tiene.
 */
export const valorViajeTransnacional = (viaje) =>
  viaje?.transnational_number ?? viaje?.trip_number ?? ""

/**
 * El movimiento que le toca a la continuación de un viaje.
 *
 * Cada mitad de un cruce lleva su número de movimiento; la que se está creando
 * continúa la anterior. Si el viaje elegido no trae movimiento, se deja vacío
 * para que la persona lo escriba.
 *
 * @param {ViajeTransnacional} viaje El viaje que se continúa.
 * @returns {string} El siguiente movimiento, o cadena vacía.
 */
export function siguienteMovimiento(viaje) {
  if (viaje?.movement_number === null || viaje?.movement_number === undefined) return ""
  return String(Number(viaje.movement_number) + 1)
}
