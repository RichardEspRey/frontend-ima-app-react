import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { cotizacionDesdeApi, cotizacionParaGuardar } from "../model/cotizacion"

/**
 * Llave de caché del historial de cotizaciones.
 *
 * @type {Array}
 */
export const LLAVE_COTIZACIONES = ["cotizaciones"]

/**
 * El historial de cotizaciones guardadas.
 *
 * @endpoint POST Cotizaciones.php · op=obtener_todas
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las cotizaciones, listas para cargarse.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerCotizaciones(opciones = {}) {
  const filas = await postLista(ENDPOINTS.cotizaciones, "obtener_todas", {
    signal: opciones.signal,
  })
  return filas.map(cotizacionDesdeApi)
}

/**
 * Guarda una cotización con su nombre.
 *
 * @endpoint POST Cotizaciones.php · op=guardar
 * @param {object} cotizacion El estado de la pantalla, con su nombre.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarCotizacion(cotizacion) {
  return post(ENDPOINTS.cotizaciones, "guardar", cotizacionParaGuardar(cotizacion))
}

/**
 * Elimina una cotización guardada.
 *
 * @endpoint POST Cotizaciones.php · op=eliminar
 * @param {string} id La cotización a borrar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el borrado.
 */
export function eliminarCotizacion(id) {
  return post(ENDPOINTS.cotizaciones, "eliminar", { id })
}

/**
 * El historial de cotizaciones.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useCotizaciones() {
  return useQuery({
    queryKey: LLAVE_COTIZACIONES,
    queryFn: ({ signal }) => obtenerCotizaciones({ signal }),
  })
}

/**
 * Guarda una cotización y refresca el historial.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarCotizacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarCotizacion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_COTIZACIONES }),
  })
}

/**
 * Elimina una cotización y refresca el historial.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarCotizacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarCotizacion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_COTIZACIONES }),
  })
}
