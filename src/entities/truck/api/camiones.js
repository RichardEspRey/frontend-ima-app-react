import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Camiones activos, para los selectores de viaje.
 *
 * @endpoint POST trucks.php · op=getTrucksActivos
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCamionesActivos(opciones = {}) {
  return postLista(ENDPOINTS.trucks, "getTrucksActivos", { campo: "trucks", signal: opciones.signal })
}

/**
 * Camiones activos, para los selectores de viaje.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCamionesActivos() {
  return useQuery({
    queryKey: ["camiones-activos"],
    queryFn: ({ signal }) => obtenerCamionesActivos({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Camiones activos con los campos extra de la edición completa de viaje.
 *
 * @endpoint POST trucks.php · op=getTrucksActivosComplete
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCamionesActivosCompletos(opciones = {}) {
  return postLista(ENDPOINTS.trucks, "getTrucksActivosComplete", { campo: "trucks", signal: opciones.signal })
}

/**
 * Camiones activos con los campos extra de la edición completa de viaje.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCamionesActivosCompletos() {
  return useQuery({
    queryKey: ["camiones-activos-completos"],
    queryFn: ({ signal }) => obtenerCamionesActivosCompletos({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}
