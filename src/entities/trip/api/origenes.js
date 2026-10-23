import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"

/**
 * Trae el catálogo de orígenes que se ofrecen al capturar una etapa vacía.
 *
 * @endpoint POST new_tripsv2.php · op=get_origenes
 * @param {object} [parametros] Datos de la consulta.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<{nombre: string, zip_code: string}>>} Los orígenes; vacío si no hay.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerOrigenes({ signal } = {}) {
  return postLista(ENDPOINTS.nuevosViajesV2, "get_origenes", { signal })
}

/**
 * El catálogo de orígenes, compartido por todas las etapas vacías en pantalla.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useOrigenes() {
  return useQuery({
    queryKey: ["viajes", "origenes"],
    queryFn: obtenerOrigenes,
    staleTime: 5 * 60_000,
  })
}
