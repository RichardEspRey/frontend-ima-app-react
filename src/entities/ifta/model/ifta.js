import { z } from "zod"
import { numeroPhp } from "../../../shared/api/zodPhp"

/**
 * Millas recorridas y galones cargados en un estado, dentro de un periodo.
 *
 * `periodo` viene vacío en la respuesta real: el corte se decide con `trip_year`
 * y los filtros de fecha, no con ese campo.
 */
export const esquemaPeriodoIfta = z.object({
  estado: z.string().catch(""),
  periodo: z.string().catch(""),
  total_millas: numeroPhp(),
  galones: numeroPhp(),
  trip_year: z.string().catch(""),
})

/**
 * Millas totales por estado, con cuántos viajes las produjeron.
 */
export const esquemaTotalEstado = z.object({
  state: z.string().catch(""),
  total: numeroPhp(),
  trips: numeroPhp(),
})

/**
 * Rendimiento de un estado: millas recorridas por galón cargado.
 *
 * Es el número que importa para IFTA, porque el impuesto se paga por la
 * diferencia entre dónde se recorrió y dónde se compró el combustible.
 *
 * @param {object} registro El registro del estado.
 * @returns {number} Millas por galón, o 0 si no se cargó combustible ahí.
 */
export function rendimientoEstado(registro) {
  const galones = Number(registro?.galones ?? 0)
  if (galones <= 0) return 0
  return Number(registro?.total_millas ?? 0) / galones
}

/**
 * Suma millas y galones de una lista de estados.
 *
 * @param {Array} registros Los registros a sumar.
 * @returns {{millas: number, galones: number, estados: number}} Los totales.
 */
export function totalesIfta(registros = []) {
  return {
    millas: registros.reduce((suma, r) => suma + Number(r.total_millas ?? 0), 0),
    galones: registros.reduce((suma, r) => suma + Number(r.galones ?? 0), 0),
    estados: registros.length,
  }
}

/**
 * Agrupa los registros por año fiscal, del más reciente al más antiguo.
 *
 * @param {Array} registros Los registros a agrupar.
 * @returns {Array.<{anio: string, registros: Array}>} Los grupos.
 */
export function agruparPorAnio(registros = []) {
  const grupos = new Map()

  for (const registro of registros) {
    const clave = registro.trip_year || "—"
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(registro)
  }

  return [...grupos.entries()]
    .map(([anio, lista]) => ({ anio, registros: lista }))
    .sort((a, b) => b.anio.localeCompare(a.anio))
}

/**
 * Valida una lista con el esquema dado, descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @param {object} esquema Esquema zod con el que validar cada fila.
 * @returns {{validos: Array, descartados: number}} Los que pasaron y cuántos no.
 */
export function normalizarLista(filas = [], esquema) {
  const validos = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquema.safeParse(fila)
    if (resultado.success) validos.push(resultado.data)
    else descartados += 1
  }

  return { validos, descartados }
}
