import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Cajas externas activas: las que no son propias de IMA.
 *
 * @endpoint POST caja_externa.php · op=getCajasExternasActivas
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCajasExternasActivas(opciones = {}) {
  return postLista(ENDPOINTS.cajaExterna, "getCajasExternasActivas", {
    campo: "cajas",
    signal: opciones.signal,
  })
}

/**
 * Cajas externas activas, cacheadas y compartidas entre pantallas.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCajasExternasActivas() {
  return useQuery({
    queryKey: ["cajas-externas-activas"],
    queryFn: ({ signal }) => obtenerCajasExternasActivas({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}
