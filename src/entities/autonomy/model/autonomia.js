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
 * Cuántas cargas entran en el cálculo de cada camión: las últimas cinco de más
 * de 100 galones. Es también el número de columnas de la tabla.
 *
 * @type {number}
 */
export const REGISTROS_POR_CAMION = 5

const registrosValidos = z
  .array(z.unknown())
  .catch([])
  .transform((lista) =>
    lista.flatMap((registro) => {
      const resultado = esquemaRegistroAutonomia.safeParse(registro)
      return resultado.success ? [resultado.data] : []
    }),
  )

/**
 * La autonomía de un camión, con sus registros de rendimiento anidados.
 *
 * Un registro vacío o mal formado se omite sin tirar los demás: un camión con
 * tres cargas válidas sigue mostrando esas tres.
 */
export const esquemaAutonomia = z.object({
  truck_id: idPhp(),
  unidad: z.string().catch(""),
  placa: nullable(z.string()),
  registros: registrosValidos,
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
 * Qué tan bueno es un rendimiento.
 *
 * @readonly
 * @enum {string}
 */
export const NIVEL_RENDIMIENTO = {
  BUENO: "bueno",
  REGULAR: "regular",
  BAJO: "bajo",
  SIN_DATO: "sin_dato",
}

/**
 * Millas por galón desde las que un rendimiento es bueno, y desde las que es
 * regular. Por debajo de la segunda es bajo.
 *
 * @readonly
 */
export const UMBRAL_RENDIMIENTO = { BUENO: 7, REGULAR: 5.5 }

/**
 * Clasifica un rendimiento en millas por galón.
 *
 * @param {*} mpg El rendimiento.
 * @returns {string} Uno de `NIVEL_RENDIMIENTO`; `SIN_DATO` si no hay un número positivo.
 */
export function nivelRendimiento(mpg) {
  const valor = Number(mpg)
  if (!Number.isFinite(valor) || valor <= 0) return NIVEL_RENDIMIENTO.SIN_DATO
  if (valor >= UMBRAL_RENDIMIENTO.BUENO) return NIVEL_RENDIMIENTO.BUENO
  if (valor >= UMBRAL_RENDIMIENTO.REGULAR) return NIVEL_RENDIMIENTO.REGULAR
  return NIVEL_RENDIMIENTO.BAJO
}

/**
 * Los registros de un camión acomodados en sus casillas, del más reciente al
 * más antiguo, con `null` en las que no tienen carga.
 *
 * @param {Autonomia} autonomia El camión.
 * @returns {Array.<(object|null)>} Siempre `REGISTROS_POR_CAMION` casillas.
 */
export function registrosEnCasillas(autonomia) {
  const registros = (autonomia?.registros ?? []).slice(0, REGISTROS_POR_CAMION)
  return Array.from({ length: REGISTROS_POR_CAMION }, (_, i) => registros[i] ?? null)
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
