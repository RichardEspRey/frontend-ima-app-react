/**
 * Los totales de un viaje: lo que se cobra y lo que cuesta.
 *
 * @typedef {object} TotalesViaje
 * @property {number} tarifa Lo facturado por las etapas.
 * @property {number} diesel Lo gastado en combustible.
 * @property {number} gastos Los demás gastos del viaje.
 * @property {number} pagoConductor Lo que se le paga al conductor.
 * @property {number} utilidad Lo que queda después de restarlo todo.
 */

/**
 * Un número de la API, que puede venir como texto, nulo o ausente.
 *
 * @param {*} valor Lo que vino.
 * @returns {number} El número, o 0.
 */
const numero = (valor) => {
  const convertido = Number(valor)
  return Number.isFinite(convertido) ? convertido : 0
}

/**
 * Los totales de un viaje, tomados de donde el backend los publica.
 *
 * El backend ya calcula los cinco números y los manda en `totales`. La pantalla
 * los recalculaba, y para el pago al conductor leía `driver_payments.total_monto`
 * —una clave que la respuesta **no tiene**—, así que el renglón "Pago a
 * conductor" salía siempre en cero aunque la API mandara el importe: en el viaje
 * 480, 1 122.26 USD que nunca se vieron.
 *
 * Ojo con la utilidad: la que publica el backend es `rate - diesel - gastos`,
 * **sin restar el pago al conductor** (comprobado con el viaje 480: 6 200 −
 * 1 509 − 188 = 4 503, que es justo lo que manda). Es una decisión suya, no un
 * error, y por eso aquí se expone tal cual en vez de recalcularla.
 *
 * @param {object} [resumen] La respuesta de `trip_summary`.
 * @returns {TotalesViaje} Los cinco totales.
 */
export function totalesViaje(resumen) {
  const totales = resumen?.totales ?? {}

  return {
    tarifa: numero(totales.rate),
    diesel: numero(totales.diesel),
    gastos: numero(totales.gastos),
    pagoConductor: numero(totales.driver_pay),
    utilidad: numero(totales.utilidad_estimada),
  }
}

/**
 * Comprueba que la utilidad que manda el backend cuadre con sus propios números.
 *
 * Se compara contra `tarifa - diesel - gastos`, que es como el backend la
 * calcula: el pago al conductor queda fuera. No corrige nada; solo permite
 * avisar cuando el resumen se contradice, que es mejor que enseñar dos cifras
 * que no cuadran sin decir nada.
 *
 * @param {TotalesViaje} totales Los totales del viaje.
 * @param {number} [tolerancia=1] Cuánto se admite de diferencia por redondeos.
 * @returns {boolean} `true` si la utilidad cuadra.
 */
export function utilidadCuadra(totales, tolerancia = 1) {
  const calculada = totales.tarifa - totales.diesel - totales.gastos
  return Math.abs(calculada - totales.utilidad) <= tolerancia
}

/**
 * Lo que queda del viaje después de pagarle también al conductor.
 *
 * La utilidad del backend no lo descuenta, así que este es el número que hay
 * que mirar para saber qué deja el viaje de verdad.
 *
 * @param {TotalesViaje} totales Los totales del viaje.
 * @returns {number} La utilidad menos el pago al conductor.
 */
export const utilidadNeta = (totales) => totales.utilidad - totales.pagoConductor

/**
 * Las etapas de un resumen, siempre como lista.
 *
 * @param {object} [resumen] La respuesta de `trip_summary`.
 * @returns {Array} Las etapas.
 */
export const etapasDeResumen = (resumen) =>
  Array.isArray(resumen?.stages) ? resumen.stages : []

/**
 * Las cargas de diesel de un resumen.
 *
 * @param {object} [resumen] La respuesta de `trip_summary`.
 * @returns {Array} Las cargas.
 */
export const dieselDeResumen = (resumen) =>
  Array.isArray(resumen?.diesel?.items) ? resumen.diesel.items : []

/**
 * Los gastos de un resumen.
 *
 * @param {object} [resumen] La respuesta de `trip_summary`.
 * @returns {Array} Los gastos.
 */
export const gastosDeResumen = (resumen) =>
  Array.isArray(resumen?.expenses?.items) ? resumen.expenses.items : []

/**
 * Los galones cargados en el viaje.
 *
 * @param {object} [resumen] La respuesta de `trip_summary`.
 * @returns {number} Los galones.
 */
export const galonesDeResumen = (resumen) => numero(resumen?.diesel?.total_galones)
