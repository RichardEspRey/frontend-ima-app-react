import { z } from "zod"
import { fechaDia, idPhp, nullable, numeroPhp } from "../../../shared/api/zodPhp"

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
 * Un servicio dentro de una orden: qué se le hizo a la unidad.
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
  nombre_caja: z.string().catch(""),
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
 * @property {string} nombre_camion Número del camión; vacío si la orden es de una caja.
 * @property {string} nombre_caja Número de la caja; vacío si la orden es de un camión.
 * @property {(number|null)} tipo_cambio Tipo de cambio, o `null` si es en pesos.
 * @property {Array} servicios Los servicios de la orden.
 */

/**
 * Lo que es mano de obra dentro de los detalles de un servicio.
 *
 * @readonly
 * @type {string}
 */
export const DETALLE_MANO_DE_OBRA = "Mano de Obra"

/**
 * Un concepto de un servicio, con la categoría y el gasto del que salió.
 *
 * `categoria` e `id_gasto` solo existen en las órdenes que se armaron desde
 * Reparaciones; en las demás llegan nulos.
 */
export const esquemaDetalleCompleto = z.object({
  id_detalle: idPhp(),
  id_articulo: nullable(idPhp()),
  tipo_detalle: z.string().catch(""),
  descripcion: z.string().catch(""),
  cantidad: numeroPhp(),
  costo: numeroPhp(),
  categoria: nullable(z.string()),
  id_gasto: nullable(idPhp()),
})

/**
 * Un servicio con la reparación que atendía, si salió de una.
 *
 * `punto_origen` es `inspeccion` o `manual`; nulo si el servicio se agregó en la
 * orden sin venir de ninguna reparación.
 */
export const esquemaServicioCompleto = z.object({
  id_servicio: idPhp(),
  tipo_mantenimiento: z.string().catch(""),
  origen_servicio: z.string().catch(""),
  tipo_reparacion: z.string().catch(""),
  estatus: z.string().catch(ESTATUS_ORDEN.PENDIENTE),
  punto_origen: nullable(z.string()),
  punto_categoria: z.string().nullable().catch(""),
  trip_number: nullable(z.coerce.string()),
  detalles: z.array(esquemaDetalleCompleto).catch([]),
})

/**
 * Una orden lista para editarse: sus datos generales y cada servicio completo.
 */
export const esquemaOrdenCompleta = z.object({
  orden: z.object({
    id_orden: idPhp(),
    fecha_orden: fechaDia(),
    estatus: z.string().catch(ESTATUS_ORDEN.ABIERTA),
    truck_id: nullable(idPhp()),
    caja_id: nullable(idPhp()),
    tipo_cambio: nullable(z.coerce.number()),
    nombre_camion: z.string().nullable().catch(""),
    nombre_caja: z.string().nullable().catch(""),
  }),
  servicios: z.array(esquemaServicioCompleto).catch([]),
})

/**
 * De dónde salió un servicio, para mostrarlo en la orden.
 *
 * @param {object} servicio El servicio completo.
 * @returns {(string|null)} La etiqueta, o `null` si no salió de una reparación.
 */
export function origenDeServicio(servicio) {
  if (!servicio?.punto_origen) return null
  if (servicio.punto_origen === "manual") return "Pendiente levantada a mano"

  const partes = ["Inspección", servicio.punto_categoria, servicio.trip_number && `viaje ${servicio.trip_number}`]
  return partes.filter(Boolean).join(" · ")
}

/**
 * Separa la mano de obra de las refacciones y consumibles de un servicio.
 *
 * La mano de obra se guarda como un detalle más, pero en pantalla es un solo
 * importe del servicio; lo demás se lista renglón por renglón.
 *
 * @param {Array.<object>} [detalles] Los detalles del servicio.
 * @returns {{manoDeObra: number, conceptos: Array.<object>}} La suma de mano de obra y el resto.
 */
export function separarManoDeObra(detalles = []) {
  return {
    manoDeObra: detalles
      .filter((detalle) => detalle.tipo_detalle === DETALLE_MANO_DE_OBRA)
      .reduce((suma, detalle) => suma + detalle.costo, 0),
    conceptos: detalles.filter((detalle) => detalle.tipo_detalle !== DETALLE_MANO_DE_OBRA),
  }
}

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
 * El número de la unidad de una orden, sea camión o caja.
 *
 * Una orden es de una o de otra, nunca de las dos: Reparaciones arma órdenes
 * de caja desde la inspección y esas llegan sin camión. Es lo que se compara
 * al filtrar por unidad.
 *
 * @param {Orden} orden La orden.
 * @returns {string} El número de la unidad; cadena vacía si no tiene.
 */
export const nombreUnidad = (orden) => orden?.nombre_camion || orden?.nombre_caja || ""

/**
 * Cómo se muestra la unidad de una orden: el camión tal cual y la caja con su
 * prefijo, para que «104» no se confunda con el camión 104.
 *
 * @param {Orden} orden La orden.
 * @returns {string} La etiqueta; cadena vacía si no tiene unidad.
 */
export function etiquetaUnidad(orden) {
  if (orden?.nombre_camion) return orden.nombre_camion
  if (orden?.nombre_caja) return `Caja ${orden.nombre_caja}`
  return ""
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
