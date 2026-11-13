import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"
import { anioCorto, esquemaPeriodoIfta, esquemaTotalEstado, normalizarLista } from "../model/ifta"

/**
 * Llave de caché de los periodos IFTA, que sirve de prefijo para invalidarlos todos.
 *
 * @type {Array.<string>}
 */
export const LLAVE_PERIODOS_IFTA = ["ifta", "periodos"]

/**
 * Llave de caché de los periodos de un año.
 *
 * @param {string} [anio] El año, de dos o cuatro dígitos; vacío son todos.
 * @returns {Array} La llave para `useQuery`.
 */
export const llavePeriodosIfta = (anio) => [...LLAVE_PERIODOS_IFTA, anioCorto(anio)]

/**
 * Llave de caché de los totales por estado.
 *
 * Los filtros entran en la llave para que cada combinación tenga su propio
 * resultado en vez de pisar el anterior.
 *
 * @param {object} [filtros] Estado y rango de fechas.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveTotalesIfta = (filtros) => ["ifta", "totales", filtros ?? {}]

/**
 * Trae millas y galones por estado y año fiscal.
 *
 * @endpoint POST IFTA.php · op=periodos
 * @param {object} [opciones] Ajustes de la petición.
 * @param {string} [opciones.anio] Año a traer, de dos o cuatro dígitos; vacío son todos.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los periodos normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPeriodosIfta(opciones = {}) {
  const anio = anioCorto(opciones.anio)
  const filas = await postLista(ENDPOINTS.ifta, "periodos", {
    payload: anio ? { year: anio } : {},
    signal: opciones.signal,
  })
  const { validos } = normalizarLista(filas, esquemaPeriodoIfta)
  return validos
}

/**
 * Trae las millas totales por estado, con filtros opcionales.
 *
 * Cada filtro solo viaja si trae valor: mandar un rango vacío cambiaría el
 * resultado en vez de dejarlo sin filtrar.
 *
 * @endpoint POST IFTA.php · op=get_ifta_totals_by_state
 * @param {object} [filtros] Ajustes de la consulta.
 * @param {string} [filtros.estado] Código del estado, por ejemplo `TX`.
 * @param {string} [filtros.desde] Fecha inicial, `YYYY-MM-DD`.
 * @param {string} [filtros.hasta] Fecha final, `YYYY-MM-DD`.
 * @param {AbortSignal} [filtros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los totales por estado.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerTotalesPorEstado({ estado, desde, hasta, signal } = {}) {
  const filas = await postLista(ENDPOINTS.ifta, "get_ifta_totals_by_state", {
    payload: {
      ...(estado ? { state: estado.trim().toUpperCase() } : {}),
      ...(desde ? { date_from: desde } : {}),
      ...(hasta ? { date_to: hasta } : {}),
    },
    signal,
  })
  const { validos } = normalizarLista(filas, esquemaTotalEstado)
  return validos
}

/**
 * Trae los viajes que componen un total de IFTA.
 *
 * @endpoint POST IFTA.php · op=get_ifta_trips
 * @param {object} [filtros] Ajustes de la consulta.
 * @param {string} [filtros.estado] Código del estado, por ejemplo `TX`.
 * @param {string} [filtros.desde] Fecha inicial, `YYYY-MM-DD`.
 * @param {string} [filtros.hasta] Fecha final, `YYYY-MM-DD`.
 * @param {AbortSignal} [filtros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los viajes.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerViajesIfta({ estado, desde, hasta, signal } = {}) {
  return postLista(ENDPOINTS.ifta, "get_ifta_trips", {
    payload: {
      ...(estado ? { state: estado.trim().toUpperCase() } : {}),
      ...(desde ? { date_from: desde } : {}),
      ...(hasta ? { date_to: hasta } : {}),
    },
    signal,
  })
}

/**
 * Periodos IFTA, cacheados. Cambian poco: se cachean más tiempo.
 *
 * @param {string} [anio] Año a traer; vacío son todos.
 * @returns {object} El resultado de `useQuery`.
 */
export function usePeriodosIfta(anio) {
  return useQuery({
    queryKey: llavePeriodosIfta(anio),
    queryFn: ({ signal }) => obtenerPeriodosIfta({ anio, signal }),
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Totales por estado según los filtros activos.
 *
 * @param {object} [filtros] Estado y rango de fechas.
 * @returns {object} El resultado de `useQuery`.
 */
export function useTotalesPorEstado(filtros) {
  return useQuery({
    queryKey: llaveTotalesIfta(filtros),
    queryFn: ({ signal }) => obtenerTotalesPorEstado({ ...filtros, signal }),
  })
}
