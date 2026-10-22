import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { LLAVE_MANTENIMIENTO } from "../../maintenance-point"
import { esquemaOrdenCompleta, normalizarOrdenes } from "../model/orden"

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
 * Trae una orden completa para editarla.
 *
 * Sale de `mtto.php` y no de `service_order.php · getOrderById`, que no trae el
 * origen de cada servicio ni la categoría y el gasto de cada concepto: sin eso,
 * editar la orden la enseñaba a medias.
 *
 * @endpoint POST mtto.php · op=getOrden
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.ordenId Identificador de la orden.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<{orden: object, servicios: Array.<object>}>} La orden validada.
 * @throws {ApiError} Si la orden no existe o la API falla.
 * @throws {ZodError} Si la respuesta no trae la orden.
 */
export async function obtenerOrden({ ordenId, signal }) {
  const cuerpo = await post(ENDPOINTS.mantenimiento, "getOrden", { id_orden: ordenId }, { signal })
  return esquemaOrdenCompleta.parse(cuerpo)
}

/**
 * Guarda una orden editada: sus datos generales y la lista completa de servicios.
 *
 * Los servicios nuevos van sin `id_servicio`.
 *
 * @endpoint POST service_order.php · op=UpdateOrder
 * @param {object} parametros La orden.
 * @param {string} parametros.ordenId Identificador de la orden.
 * @param {{fecha: string, truck_id: (string|null), tipo_cambio: string}} parametros.orden Datos generales.
 * @param {Array.<object>} parametros.servicios Los servicios con sus detalles.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function actualizarOrden({ ordenId, orden, servicios }) {
  return post(ENDPOINTS.serviceOrder, "UpdateOrder", {
    id_orden: ordenId,
    ordenData: orden,
    serviciosData: servicios,
  })
}

/**
 * Elimina una orden con todos sus servicios.
 *
 * Lo que la orden atendía no se pierde: vuelve a reparaciones pendientes. El
 * gasto se queda en el Administrador de Gastos, porque se pagó, y el inventario
 * que haya descontado una orden vieja no se regresa.
 *
 * @endpoint POST mtto.php · op=eliminarOrden
 * @param {object} parametros La orden.
 * @param {string} parametros.ordenId Identificador de la orden.
 * @param {string} [parametros.usuarioId] Quién la elimina.
 * @returns {Promise.<object>} La respuesta, con cuántas reparaciones regresaron.
 * @throws {ApiError} Si la orden no existe o la API falla.
 */
export function eliminarOrden({ ordenId, usuarioId }) {
  return post(ENDPOINTS.mantenimiento, "eliminarOrden", {
    id_orden: ordenId,
    id_usuario: usuarioId,
  })
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
 * Una orden completa para editarla.
 *
 * No se vuelve a pedir sola mientras la pantalla está abierta: una recarga a
 * media captura no debe pisar lo que se está editando.
 *
 * @param {string} ordenId La orden.
 * @returns {object} El resultado de `useQuery`.
 */
export function useOrden(ordenId) {
  return useQuery({
    queryKey: [...LLAVE_ORDENES, String(ordenId)],
    queryFn: ({ signal }) => obtenerOrden({ ordenId, signal }),
    enabled: Boolean(ordenId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
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

/**
 * Elimina una orden y refresca las órdenes y el flujo de Reparaciones, a donde
 * regresan sus reparaciones.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarOrden() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarOrden,
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: LLAVE_ORDENES })
      cliente.invalidateQueries({ queryKey: LLAVE_MANTENIMIENTO })
    },
  })
}

/**
 * Guarda una orden editada y refresca las órdenes, incluida la que se editó.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useActualizarOrden() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: actualizarOrden,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_ORDENES }),
  })
}
