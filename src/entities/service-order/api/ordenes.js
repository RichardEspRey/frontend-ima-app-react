import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarOrdenes } from "../model/orden"

/**
 * Llave de caché de las órdenes de servicio.
 *
 * @type {Array.<string>}
 */
export const LLAVE_ORDENES = ["ordenes-servicio"]

/**
 * Trae todas las órdenes con sus servicios anidados.
 *
 * Vienen en una sola llamada: la API anida los servicios dentro de cada orden,
 * así que no hay que pedir el detalle aparte.
 *
 * @endpoint POST service_order.php · op=getAllOrdersWithDetails
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las órdenes normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerOrdenes(opciones = {}) {
  const filas = await postLista(ENDPOINTS.serviceOrder, "getAllOrdersWithDetails", {
    signal: opciones.signal,
  })
  const { ordenes, descartados } = normalizarOrdenes(filas)

  if (descartados > 0) {
    console.warn(
      `service_order.php#getAllOrdersWithDetails devolvió ${descartados} orden(es) inválidas; se omitieron.`,
    )
  }

  return ordenes
}

/**
 * Trae una orden concreta para editarla.
 *
 * @endpoint POST service_order.php · op=getOrderById
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.ordenId Identificador de la orden.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} La orden tal como la devuelve la API.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerOrden({ ordenId, signal }) {
  return post(ENDPOINTS.serviceOrder, "getOrderById", { id_orden: ordenId }, { signal })
}

/**
 * Camiones disponibles para asignar una orden.
 *
 * Ya vienen con la forma `{value, label}` que espera react-select.
 *
 * @endpoint POST service_order.php · op=getTrucks
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los camiones.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerCamionesDeOrden(opciones = {}) {
  return postLista(ENDPOINTS.serviceOrder, "getTrucks", { signal: opciones.signal })
}

/**
 * Cambia el estatus de un servicio dentro de una orden.
 *
 * @endpoint POST service_order.php · op=updateDetailStatus
 * @param {object} parametros Datos del cambio.
 * @param {string} parametros.servicioId Servicio a cambiar.
 * @param {string} parametros.estatus Nuevo estatus.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function cambiarEstatusServicio({ servicioId, estatus }) {
  return post(ENDPOINTS.serviceOrder, "updateDetailStatus", {
    id_servicio: servicioId,
    estatus,
  })
}

/**
 * Órdenes de servicio, cacheadas.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useOrdenes() {
  return useQuery({
    queryKey: LLAVE_ORDENES,
    queryFn: ({ signal }) => obtenerOrdenes({ signal }),
  })
}

/**
 * Camiones para el formulario de orden. Es un catálogo: se cachea más tiempo.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useCamionesDeOrden() {
  return useQuery({
    queryKey: ["ordenes-servicio", "camiones"],
    queryFn: ({ signal }) => obtenerCamionesDeOrden({ signal }),
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Cambia el estatus de un servicio y refresca las órdenes.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCambiarEstatusServicio() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: cambiarEstatusServicio,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_ORDENES }),
  })
}
