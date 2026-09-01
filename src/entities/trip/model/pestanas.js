/**
 * Las pestañas del administrador de viajes.
 *
 * El `id` es el `tabValue` que espera la API, no la posición en pantalla: la
 * programación es la primera que se ve pero la última que se agregó, de ahí que
 * su id sea el 4.
 *
 * Cada pestaña se muestra solo si la persona tiene su permiso.
 *
 * @type {Array.<{id: number, etiqueta: string, permiso: string}>}
 */
export const PESTANAS_VIAJES = [
  { id: 4, etiqueta: "Programación de Viajes", permiso: "viajes_tab_programacion" },
  { id: 0, etiqueta: "Up Coming", permiso: "viajes_tab_upcoming" },
  { id: 1, etiqueta: "Despacho", permiso: "viajes_tab_despacho" },
  { id: 2, etiqueta: "En Ruta", permiso: "viajes_tab_en_ruta" },
  { id: 3, etiqueta: "Finalizados", permiso: "viajes_tab_completados" },
]

/**
 * El id de la pestaña de programación, que no lista viajes sino programaciones.
 *
 * @type {number}
 */
export const PESTANA_PROGRAMACION = 4

/**
 * El id de la pestaña de próximos, cuya edición va a otra pantalla.
 *
 * @type {number}
 */
export const PESTANA_PROXIMOS = 0

/**
 * Las pestañas que una persona puede ver, según sus permisos.
 *
 * @param {object} [permisos] Los permisos de la sesión.
 * @returns {Array} Las pestañas visibles, en el orden de `PESTANAS_VIAJES`.
 */
export const pestanasPermitidas = (permisos) =>
  permisos ? PESTANAS_VIAJES.filter((pestana) => permisos[pestana.permiso] === true) : []

/**
 * La pestaña a la que caer cuando la elegida ya no está permitida.
 *
 * Los permisos se refrescan cada 15 segundos, así que a alguien se le puede
 * retirar el acceso a la pestaña que está mirando.
 *
 * @param {Array} permitidas Las pestañas visibles.
 * @param {number} actual La pestaña seleccionada.
 * @returns {(number|null)} A qué pestaña moverse, o `null` si la actual sigue valiendo.
 */
export function pestanaDeReemplazo(permitidas, actual) {
  if (permitidas.length === 0) return null
  if (permitidas.some((pestana) => pestana.id === actual)) return null
  return permitidas[0].id
}

/**
 * Los filtros de la lista de viajes, con el nombre que espera la API.
 *
 * @type {Array.<string>}
 */
export const FILTROS_VIAJES = [
  "filterTrip",
  "filterDriver",
  "filterTruck",
  "filterTrailer",
  "filterCompany",
  "filterOrigin",
  "filterDestination",
  "filterDirection",
  "filterCI",
]

/**
 * El valor del filtro de dirección que significa "no filtrar".
 *
 * @type {string}
 */
export const DIRECCION_TODAS = "All"

/**
 * Cuántos filtros están puestos.
 *
 * Sirve para el contador de la barra: la dirección solo cuenta si no es "todas".
 *
 * @param {object} [filtros] Los filtros actuales.
 * @returns {number} Cuántos están activos.
 */
export function filtrosActivos(filtros = {}) {
  return FILTROS_VIAJES.filter((campo) => {
    const valor = filtros[campo]
    if (campo === "filterDirection") return valor && valor !== DIRECCION_TODAS
    return Boolean(valor)
  }).length
}
