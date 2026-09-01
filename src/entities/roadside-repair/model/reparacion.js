import { z } from "zod"
import { idPhp, numeroPhp, nullable, fechaDia } from "../../../shared/api/zodPhp"

/**
 * Un documento adjunto a una reparación.
 */
export const esquemaDocumento = z.object({
  id: nullable(idPhp()),
  url: nullable(z.string()),
  nombre: z.string().catch(""),
})

/**
 * Una reparación en ruta: lo que le pasó a un camión durante un viaje.
 *
 * Ojo con las dos fechas, que no son lo mismo:
 * - `fecha_suceso` es **cuándo ocurrió** la avería.
 * - `fecha_registro` es **cuándo se capturó** en el sistema.
 *
 * `fecha_suceso` se agregó después y admite nulos a propósito: la app móvil
 * también da de alta reparaciones, y el UPDATE del backend solo toca la columna
 * si el campo llegó en el POST, para que un cliente que no la mande no borre la
 * fecha existente. Al 2026-09-01 está nula en todos los registros.
 */
export const esquemaReparacion = z.object({
  id_reparacion: idPhp(),
  fecha_registro: fechaDia(),
  fecha_suceso: nullable(fechaDia()),
  truck_id: nullable(idPhp()),
  nombre_camion: z.string().catch(""),
  trip_id: nullable(idPhp()),
  formatted_trip: z.string().catch(""),
  operador: z.string().catch(""),
  ciudad: z.string().catch(""),
  estado: z.string().catch(""),
  fallo: z.string().catch(""),
  tipo_reparacion: z.string().catch(""),
  comentarios: z.string().catch(""),
  costo_reparacion: numeroPhp(),
  costo_refacciones: numeroPhp(),
  total: numeroPhp(),
  documentos: z.array(esquemaDocumento).catch([]),
})

/**
 * Una reparación en ruta ya validada.
 *
 * @typedef {object} Reparacion
 * @property {string} id_reparacion Identificador.
 * @property {string} fecha_registro Cuándo se capturó.
 * @property {(string|null)} fecha_suceso Cuándo ocurrió; puede faltar.
 * @property {string} nombre_camion Unidad afectada.
 * @property {string} operador Conductor que reportó.
 * @property {number} costo_reparacion Mano de obra.
 * @property {number} costo_refacciones Refacciones.
 * @property {number} total Suma de ambos.
 * @property {Array} documentos Comprobantes adjuntos.
 */

/**
 * La fecha con la que conviene mostrar una reparación.
 *
 * Prefiere cuándo ocurrió; si no se capturó, cae a cuándo se registró. Así la
 * lista siempre tiene una fecha que enseñar aunque falte la del suceso.
 *
 * @param {Reparacion} reparacion La reparación a evaluar.
 * @returns {string} La fecha, o cadena vacía si no hay ninguna.
 */
export const fechaRelevante = (reparacion) =>
  reparacion?.fecha_suceso || reparacion?.fecha_registro || ""

/**
 * Comprueba que el total cuadre con la suma de sus partes.
 *
 * El backend lo calcula, así que aquí no se recalcula —serían dos verdades que
 * pueden discrepar—, pero sí se puede detectar cuando no cuadra.
 *
 * @param {Reparacion} reparacion La reparación a evaluar.
 * @param {number} [tolerancia=0.01] Margen para los redondeos de MySQL.
 * @returns {boolean} `true` si el total coincide con la suma.
 */
export function totalCuadra(reparacion, tolerancia = 0.01) {
  const suma = Number(reparacion?.costo_reparacion ?? 0) + Number(reparacion?.costo_refacciones ?? 0)
  return Math.abs(suma - Number(reparacion?.total ?? 0)) <= tolerancia
}

/**
 * Indica si una reparación tiene comprobantes adjuntos.
 *
 * @param {Reparacion} reparacion La reparación a evaluar.
 * @returns {boolean} `true` si tiene al menos un documento.
 */
export const tieneDocumentos = (reparacion) => (reparacion?.documentos?.length ?? 0) > 0

/**
 * Valida la lista de reparaciones descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{reparaciones: Array.<Reparacion>, descartados: number}} Las válidas y cuántas se cayeron.
 */
export function normalizarReparaciones(filas = []) {
  const reparaciones = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaReparacion.safeParse(fila)
    if (resultado.success) reparaciones.push(resultado.data)
    else descartados += 1
  }

  return { reparaciones, descartados }
}
