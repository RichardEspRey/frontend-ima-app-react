import { z } from "zod"

/**
 * Estados por los que pasa una orden de servicio y cada uno de sus servicios.
 *
 * Verificado contra la API el 2026-09-01: son los tres únicos valores que
 * aparecen, tanto en órdenes como en servicios.
 *
 * @readonly
 * @enum {string}
 */
export const ESTATUS_ORDEN = {
  ABIERTA: "Abierta",
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
}

const idDePhp = z.coerce.string()
const numeroDePhp = z.coerce.number().catch(0)

/**
 * Un servicio dentro de una orden: qué se le hizo al camión.
 *
 * `detalles` son las refacciones y la mano de obra; puede venir vacío.
 */
export const esquemaServicio = z.object({
  id_servicio: idDePhp,
  id_orden: idDePhp,
  tipo_mantenimiento: z.string().catch(""),
  tipo_reparacion: z.string().catch(""),
  estatus: z.string().catch(ESTATUS_ORDEN.ABIERTA),
  fecha_termino: z.union([z.string(), z.null()]).catch(null),
  detalles: z.array(z.unknown()).catch([]),
})

/**
 * Una orden de servicio con sus servicios anidados.
 *
 * La API los devuelve así, en una sola llamada: no hay que pedir el detalle
 * aparte. `tipo_cambio` viene nulo cuando la orden es en pesos.
 */
export const esquemaOrden = z.object({
  id_orden: idDePhp,
  fecha_orden: z.string().catch("").transform((v) => v.split(" ")[0] ?? ""),
  estatus: z.string().catch(ESTATUS_ORDEN.ABIERTA),
  truck_id: idDePhp,
  nombre_camion: z.string().catch(""),
  tipo_cambio: z
    .union([z.null(), z.undefined(), numeroDePhp])
    .transform((v) => (v === undefined ? null : v))
    .catch(null),
  servicios: z.array(esquemaServicio).catch([]),
})

/**
 * Una orden de servicio ya validada.
 *
 * @typedef {object} Orden
 * @property {string} id_orden Identificador.
 * @property {string} fecha_orden Fecha, solo el día.
 * @property {string} estatus `Abierta`, `Pendiente` o `Completado`.
 * @property {string} truck_id Camión al que pertenece.
 * @property {string} nombre_camion Número de unidad.
 * @property {(number|null)} tipo_cambio Tipo de cambio, o `null` si es en pesos.
 * @property {Array} servicios Los servicios de la orden.
 */

/**
 * Valida una lista de órdenes descartando las que no cumplen lo mínimo.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{ordenes: Array.<Orden>, descartados: number}} Las válidas y cuántas se cayeron.
 */
export function normalizarOrdenes(filas = []) {
  const ordenes = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaOrden.safeParse(fila)
    if (resultado.success) ordenes.push(resultado.data)
    else descartados += 1
  }

  return { ordenes, descartados }
}

/**
 * Indica si una orden sigue abierta al trabajo.
 *
 * @param {Orden} orden La orden a evaluar.
 * @returns {boolean} `true` si no está completada.
 */
export const estaAbierta = (orden) => orden?.estatus !== ESTATUS_ORDEN.COMPLETADO

/**
 * Cuenta los servicios de una orden por estatus.
 *
 * Sirve para el resumen de la fila sin recorrer los servicios en el JSX.
 *
 * @param {Orden} orden La orden a resumir.
 * @returns {{total: number, completados: number, pendientes: number}} El conteo.
 */
export function resumenServicios(orden) {
  const servicios = orden?.servicios ?? []
  const completados = servicios.filter((s) => s.estatus === ESTATUS_ORDEN.COMPLETADO).length

  return {
    total: servicios.length,
    completados,
    pendientes: servicios.length - completados,
  }
}

/**
 * Indica si todos los servicios de una orden están completados.
 *
 * Una orden sin servicios **no** cuenta como completa: no hay nada hecho todavía.
 *
 * @param {Orden} orden La orden a evaluar.
 * @returns {boolean} `true` si tiene servicios y todos están completados.
 */
export function todoCompletado(orden) {
  const { total, completados } = resumenServicios(orden)
  return total > 0 && total === completados
}
