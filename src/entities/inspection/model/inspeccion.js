import { z } from "zod"
import { idPhp, numeroPhp, nullable, fechaDia } from "../../../shared/api/zodPhp"

/**
 * Un reporte dentro de una inspección: cada violación levantada.
 */
export const esquemaReporte = z.object({
  tipo_violacion: z.string().catch(""),
  descripcion: z.string().catch(""),
  comentarios: z.string().catch(""),
})

/**
 * Una inspección operativa hecha a un camión en ruta.
 *
 * Las multas se separan en dos: lo que paga IMA y lo que paga el conductor. El
 * `total` lo calcula el backend sumando ambas.
 */
export const esquemaInspeccion = z.object({
  id_inspeccion: idPhp(),
  fecha_inspeccion: fechaDia(),
  fecha_registro: fechaDia(),
  truck_id: nullable(idPhp()),
  nombre_camion: z.string().catch(""),
  trip_id: nullable(idPhp()),
  formatted_trip: z.string().catch(""),
  operador: z.string().catch(""),
  ciudad: z.string().catch(""),
  estado: z.string().catch(""),
  tipo_violacion: z.string().catch(""),
  descripcion_principal: z.string().catch(""),
  comentarios: z.string().catch(""),
  multa_ima: numeroPhp(),
  multa_driver: numeroPhp(),
  total: numeroPhp(),
  reportes: z.array(esquemaReporte).catch([]),
  documentos: z.array(z.unknown()).catch([]),
})

/**
 * Una inspección ya validada.
 *
 * @typedef {object} Inspeccion
 * @property {string} id_inspeccion Identificador.
 * @property {string} fecha_inspeccion Cuándo se hizo la inspección.
 * @property {string} nombre_camion Unidad inspeccionada.
 * @property {string} operador Conductor.
 * @property {number} multa_ima Multa que paga la empresa.
 * @property {number} multa_driver Multa que paga el conductor.
 * @property {number} total Suma de ambas multas.
 * @property {Array} reportes Violaciones levantadas.
 */

/**
 * Indica si una inspección salió sin multa.
 *
 * Es lo normal: al 2026-09-01 las tres inspecciones registradas están en 0. Una
 * inspección limpia no es un dato faltante.
 *
 * @param {Inspeccion} inspeccion La inspección a evaluar.
 * @returns {boolean} `true` si no hay multa para nadie.
 */
export const sinMulta = (inspeccion) =>
  Number(inspeccion?.multa_ima ?? 0) === 0 && Number(inspeccion?.multa_driver ?? 0) === 0

/**
 * Cuenta las violaciones de una inspección.
 *
 * @param {Inspeccion} inspeccion La inspección a evaluar.
 * @returns {number} Cuántos reportes tiene.
 */
export const cuentaViolaciones = (inspeccion) => inspeccion?.reportes?.length ?? 0

/**
 * Comprueba que el total cuadre con la suma de las dos multas.
 *
 * @param {Inspeccion} inspeccion La inspección a evaluar.
 * @param {number} [tolerancia=0.01] Margen para los redondeos de MySQL.
 * @returns {boolean} `true` si el total coincide.
 */
export function totalCuadra(inspeccion, tolerancia = 0.01) {
  const suma = Number(inspeccion?.multa_ima ?? 0) + Number(inspeccion?.multa_driver ?? 0)
  return Math.abs(suma - Number(inspeccion?.total ?? 0)) <= tolerancia
}

/**
 * Valida la lista de inspecciones descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{inspecciones: Array.<Inspeccion>, descartados: number}} Las válidas y cuántas se cayeron.
 */
export function normalizarInspecciones(filas = []) {
  const inspecciones = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaInspeccion.safeParse(fila)
    if (resultado.success) inspecciones.push(resultado.data)
    else descartados += 1
  }

  return { inspecciones, descartados }
}
