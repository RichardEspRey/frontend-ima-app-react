import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

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

/**
 * Da de alta una caja externa desde el propio formulario de viaje.
 *
 * @endpoint POST caja_externa.php · op=Alta
 * @param {object} datos Los campos de la caja.
 * @returns {Promise.<object>} La caja creada, con su id.
 * @throws {ApiError} Si la API rechaza el alta.
 */
export async function crearCajaExterna(datos) {
  const cuerpo = await post(ENDPOINTS.cajaExterna, "Alta", datos)
  return cuerpo?.caja
}

/**
 * Da de alta una caja externa y refresca el catálogo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearCajaExterna() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: crearCajaExterna,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["cajas-externas-activas"] }),
  })
}
