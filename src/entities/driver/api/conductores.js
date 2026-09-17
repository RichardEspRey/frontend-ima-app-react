import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Conductores activos, para los selectores de viaje.
 *
 * Usa la operación «Complete», que es la que trae a todos los conductores con
 * los campos que piden los formularios de viaje. La operación corta se dejó de
 * usar en la rama de trabajo el 2026-09-13 porque devolvía menos gente; aquí
 * había dos consultas, una por operación, y se quedó solo esta para que ninguna
 * pantalla vuelva a ver una lista distinta que la de al lado.
 *
 * @endpoint POST drivers.php · op=getDriversActivosComplete
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerConductoresActivos(opciones = {}) {
  return postLista(ENDPOINTS.drivers, "getDriversActivosComplete", { campo: "drivers", signal: opciones.signal })
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
