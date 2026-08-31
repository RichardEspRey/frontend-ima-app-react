import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Compañías dadas de alta.
 *
 * @endpoint POST companies.php · op=getCompanies
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCompanias(opciones = {}) {
  return postLista(ENDPOINTS.companies, "getCompanies", { campo: "companies", signal: opciones.signal })
}

/**
 * Compañías dadas de alta.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCompanias() {
  return useQuery({
    queryKey: ["companias"],
    queryFn: ({ signal }) => obtenerCompanias({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}
