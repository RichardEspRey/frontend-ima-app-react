import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Conductores activos, para los selectores de viaje.
 *
 * @endpoint POST drivers.php · op=getDriversActivos
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerConductoresActivos(opciones = {}) {
  return postLista(ENDPOINTS.drivers, "getDriversActivos", { campo: "drivers", signal: opciones.signal })
}

/**
 * Conductores activos, para los selectores de viaje.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useConductoresActivos() {
  return useQuery({
    queryKey: ["conductores-activos"],
    queryFn: ({ signal }) => obtenerConductoresActivos({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Conductores activos con los campos extra que pide la edición completa de viaje.
 *
 * @endpoint POST drivers.php · op=getDriversActivosComplete
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerConductoresActivosCompletos(opciones = {}) {
  return postLista(ENDPOINTS.drivers, "getDriversActivosComplete", { campo: "drivers", signal: opciones.signal })
}

/**
 * Conductores activos con los campos extra que pide la edición completa de viaje.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useConductoresActivosCompletos() {
  return useQuery({
    queryKey: ["conductores-activos-completos"],
    queryFn: ({ signal }) => obtenerConductoresActivosCompletos({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}
