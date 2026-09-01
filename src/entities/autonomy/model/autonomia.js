import { z } from "zod"
import { idPhp, numeroPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Un registro de rendimiento: cuánto recorrió el camión con cuántos galones.
 */
export const esquemaRegistroAutonomia = z.object({
  fecha: z.string().catch(""),
  mpg: numeroPhp(),
  distancia: numeroPhp(),
  galones: numeroPhp(),
})

/**
 * La autonomía de un camión, con sus registros de rendimiento anidados.
 */
export const esquemaAutonomia = z.object({
  truck_id: idPhp(),
  unidad: z.string().catch(""),
  placa: nullable(z.string()),
  registros: z.array(esquemaRegistroAutonomia).catch([]),
})

/**
 * La autonomía de un camión, ya validada.
 *
 * @typedef {object} Autonomia
 * @property {string} truck_id Identificador del camión.
 * @property {string} unidad Número de unidad.
 * @property {(string|null)} placa Placa del camión.
 * @property {Array} registros Registros de rendimiento, del más reciente al más antiguo.
 */

/**
 * Promedio de millas por galón de un camión.
 *
 * Ignora los registros con rendimiento 0 o negativo: son cargas sin recorrido
 * asociado, y meterlas en el promedio lo hunde sin que nada haya pasado.
 *
 * @param {Autonomia} autonomia El camión a evaluar.
 * @returns {number} El promedio, o 0 si no hay registros útiles.
 */
export function promedioMpg(autonomia) {
  const utiles = (autonomia?.registros ?? []).filter((r) => Number(r.mpg) > 0)
  if (utiles.length === 0) return 0
  return utiles.reduce((suma, r) => suma + Number(r.mpg), 0) / utiles.length
}

/**
 * El registro más reciente de un camión.
 *
 * Los registros vienen ordenados del más reciente al más antiguo.
 *
 * @param {Autonomia} autonomia El camión a evaluar.
 * @returns {(object|null)} El último registro, o `null` si no hay ninguno.
 */
export const ultimoRegistro = (autonomia) => autonomia?.registros?.[0] ?? null

/**
 * Totales de distancia y galones de un camión.
 *
 * @param {Autonomia} autonomia El camión a evaluar.
 * @returns {{distancia: number, galones: number, registros: number}} Los totales.
 */
export function totales(autonomia) {
  const registros = autonomia?.registros ?? []
  return {
    distancia: registros.reduce((suma, r) => suma + Number(r.distancia ?? 0), 0),
    galones: registros.reduce((suma, r) => suma + Number(r.galones ?? 0), 0),
    registros: registros.length,
  }
}

/**
 * Valida la lista de autonomías descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{autonomias: Array.<Autonomia>, descartados: number}} Las válidas y cuántas se cayeron.
 */
export function normalizarAutonomias(filas = []) {
  const autonomias = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaAutonomia.safeParse(fila)
    if (resultado.success) autonomias.push(resultado.data)
    else descartados += 1
  }

  return { autonomias, descartados }
}
