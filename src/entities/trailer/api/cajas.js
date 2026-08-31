import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Cajas propias activas.
 *
 * @endpoint POST cajas.php · op=getCajasActivas
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCajasActivas(opciones = {}) {
  return postLista(ENDPOINTS.cajas, "getCajasActivas", { campo: "cajas", signal: opciones.signal })
}

/**
 * Cajas propias activas.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCajasActivas() {
  return useQuery({
    queryKey: ["cajas-activas"],
    queryFn: ({ signal }) => obtenerCajasActivas({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Cajas propias activas con los campos de la edición completa de viaje.
 *
 * @endpoint POST cajas.php · op=getCajasActivasComplete
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCajasActivasCompletas(opciones = {}) {
  return postLista(ENDPOINTS.cajas, "getCajasActivasComplete", { campo: "cajas", signal: opciones.signal })
}

/**
 * Cajas propias activas con los campos de la edición completa de viaje.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCajasActivasCompletas() {
  return useQuery({
    queryKey: ["cajas-activas-completas"],
    queryFn: ({ signal }) => obtenerCajasActivasCompletas({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}
