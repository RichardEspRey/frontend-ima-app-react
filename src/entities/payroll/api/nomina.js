import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { esquemaDetallePago, esquemaPeriodo, normalizarLista } from "../model/nomina"

/**
 * Llave de caché de los periodos de nómina.
 *
 * @type {Array.<string>}
 */
export const LLAVE_PERIODOS = ["nomina", "periodos"]

/**
 * Llave de caché del desglose de un periodo.
 *
 * @param {string} periodId Identificador del periodo.
 * @returns {Array.<string>} La llave para `useQuery`.
 */
export const llaveDetalle = (periodId) => ["nomina", "detalle", String(periodId)]

const avisarDescartados = (op, descartados) => {
  if (descartados > 0) {
    console.warn(`pagos_admin.php#${op} devolvió ${descartados} registro(s) inválidos; se omitieron.`)
  }
}

/**
 * Trae todas las semanas de nómina, validadas.
 *
 * @endpoint POST pagos_admin.php · op=get_weeks
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<Periodo>>} Los periodos normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPeriodos(opciones = {}) {
  const filas = await postLista(ENDPOINTS.pagosAdmin, "get_weeks", { signal: opciones.signal })
  const { validos, descartados } = normalizarLista(filas, esquemaPeriodo)
  avisarDescartados("get_weeks", descartados)
  return validos
}

/**
 * Trae el desglose por empleado de una semana.
 *
 * @endpoint POST pagos_admin.php · op=get_details
 * @param {object} parametros Datos del periodo.
 * @param {string} parametros.periodId Identificador del periodo.
 * @param {string} parametros.fechaCorte Fecha de corte de la semana.
 * @param {string} parametros.estado Estado del periodo.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<DetallePago>>} El desglose normalizado.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerDetalle({ periodId, fechaCorte, estado, signal }) {
  const filas = await postLista(ENDPOINTS.pagosAdmin, "get_details", {
    payload: { period_id: periodId, fecha_corte: fechaCorte, estado },
    signal,
  })
  const { validos, descartados } = normalizarLista(filas, esquemaDetallePago)
  avisarDescartados("get_details", descartados)
  return validos
}

/**
 * Cierra el corte de una semana. **Es irreversible desde la app.**
 *
 * @endpoint POST pagos_admin.php · op=authorize
 * @param {Periodo} periodo La semana a autorizar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function autorizarPeriodo(periodo) {
  return post(ENDPOINTS.pagosAdmin, "authorize", {
    period_id: periodo.period_id,
    anio: periodo.anio,
    semana: periodo.semana,
    fecha_corte: periodo.fecha_corte,
  })
}

/**
 * Semanas de nómina, cacheadas.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function usePeriodos() {
  return useQuery({
    queryKey: LLAVE_PERIODOS,
    queryFn: ({ signal }) => obtenerPeriodos({ signal }),
  })
}

/**
 * Desglose de una semana. No se dispara hasta tener los datos del periodo.
 *
 * @param {(Periodo|undefined)} periodo La semana de la que se quiere el desglose.
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useDetallePeriodo(periodo) {
  return useQuery({
    queryKey: llaveDetalle(periodo?.period_id),
    enabled: Boolean(periodo?.period_id),
    queryFn: ({ signal }) =>
      obtenerDetalle({
        periodId: periodo.period_id,
        fechaCorte: periodo.fecha_corte,
        estado: periodo.estado,
        signal,
      }),
  })
}

/**
 * Autoriza una semana y refresca la lista al terminar.
 *
 * @returns {object} El resultado de `useMutation`: `{mutateAsync, isPending, error}`.
 */
export function useAutorizarPeriodo() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: autorizarPeriodo,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_PERIODOS }),
  })
}
