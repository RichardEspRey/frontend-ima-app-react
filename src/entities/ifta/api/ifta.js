import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"
import { anioCorto, esquemaTotalEstado, normalizarGalonesIfta, normalizarLista } from "../model/ifta"

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
 * Trae los galones cargados por estado y periodo.
 *
 * @endpoint POST IFTA.php · op=galones_ifta
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<{estado: string, periodo: string, galones: number}>>} Los registros.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerGalonesIfta(opciones = {}) {
  const filas = await postLista(ENDPOINTS.ifta, "galones_ifta", { signal: opciones.signal })
  return normalizarGalonesIfta(filas)
}

/**
 * Trae las cargas de diesel que forman los galones de un estado en un periodo.
 *
 * Un viaje puede tener varias cargas, así que puede aparecer más de una vez.
 *
 * @endpoint POST IFTA.php · op=galones_ifta_detalle
 * @param {object} filtros Qué detalle pedir.
 * @param {string} filtros.estado El estado; vacío para las cargas sin estado.
 * @param {string} filtros.periodo El periodo; vacío para las cargas sin periodo.
 * @param {AbortSignal} [filtros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<{trip_number: string, galones: number}>>} Las cargas.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerDetalleGalonesIfta({ estado, periodo, signal }) {
  return postLista(ENDPOINTS.ifta, "galones_ifta_detalle", {
    payload: { estado: estado ?? "", periodo: periodo ?? "" },
    signal,
  })
}

/**
 * Trae las millas por estado y por unidad, con filtros opcionales.
 *
 * El número de viaje se reinicia cada año, así que el rango de viajes va con el año,
 * en dos dígitos como lo guarda la base. Los filtros vacíos no se mandan.
 *
 * @endpoint POST IFTA.php · op=millas_unidades
 * @param {object} [filtros] Ajustes de la consulta.
 * @param {string} [filtros.anio] Año, de dos o cuatro dígitos.
 * @param {string} [filtros.viajeDesde] Primer número de viaje.
 * @param {string} [filtros.viajeHasta] Último número de viaje.
 * @param {AbortSignal} [filtros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Una fila por estado y unidad.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerMillasUnidades({ anio, viajeDesde, viajeHasta, signal } = {}) {
  const campos = {
    year: anioCorto(anio),
    trip_from: String(viajeDesde ?? "").trim(),
    trip_to: String(viajeHasta ?? "").trim(),
  }
  return postLista(ENDPOINTS.ifta, "millas_unidades", {
    payload: Object.fromEntries(Object.entries(campos).filter(([, valor]) => valor)),
    signal,
  })
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
