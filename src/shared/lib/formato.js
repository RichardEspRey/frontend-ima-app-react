/**
 * Con qué convenciones se formatean los números y las fechas.
 *
 * Hoy el proyecto formatea dinero a mano en **27 sitios**, y no todos igual:
 * unos usan `es-MX` y otros `en-US`, así que la misma cantidad se ve distinta
 * según la pantalla. Este módulo existe para que eso converja módulo a módulo;
 * el valor por omisión es el que ya usan las pantallas de viajes.
 *
 * @type {string}
 */
export const LOCALE = "es-MX"

/**
 * Moneda con la que se opera casi todo.
 *
 * @type {string}
 */
export const MONEDA = "USD"

const GUION = "—"

/**
 * Formatea una cantidad como dinero.
 *
 * Un valor ausente o ilegible se muestra como cero, no como `NaN`: en una
 * columna de importes, un cero se entiende y un `NaN` asusta.
 *
 * @param {*} valor La cantidad.
 * @param {string} [codigo='USD'] Código de la moneda.
 * @param {string} [locale='es-MX'] Convención de formato.
 * @returns {string} La cantidad formateada.
 */
export function moneda(valor, codigo = MONEDA, locale = LOCALE) {
  const numero = Number(valor)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: codigo,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numero) ? numero : 0)
}

/**
 * Formatea una fecha con su hora.
 *
 * @param {*} valor La fecha, como la manda la API.
 * @param {string} [locale='es-MX'] Convención de formato.
 * @returns {string} La fecha y hora, o una raya si no hay fecha válida.
 */
export function fechaHora(valor, locale = LOCALE) {
  if (!valor) return GUION
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? GUION : fecha.toLocaleString(locale)
}

/**
 * Formatea una fecha sin hora.
 *
 * @param {*} valor La fecha, como la manda la API.
 * @param {string} [locale='es-MX'] Convención de formato.
 * @returns {string} La fecha, o una raya si no hay fecha válida.
 */
export function soloFecha(valor, locale = LOCALE) {
  if (!valor) return GUION
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? GUION : fecha.toLocaleDateString(locale)
}

/**
 * Recorta una hora `HH:MM:SS` a `HH:MM`.
 *
 * @param {*} valor La hora, como la manda la API.
 * @returns {(string|null)} La hora recortada, o `null` si no hay.
 */
export const soloHora = (valor) => (valor ? String(valor).slice(0, 5) : null)

/**
 * Formatea una cantidad con decimales fijos.
 *
 * @param {*} valor La cantidad.
 * @param {number} [cuantos=2] Cuántos decimales.
 * @returns {string} La cantidad, o `0.00` si no es un número.
 */
export function decimales(valor, cuantos = 2) {
  const numero = Number(valor)
  return (Number.isFinite(numero) ? numero : 0).toFixed(cuantos)
}
