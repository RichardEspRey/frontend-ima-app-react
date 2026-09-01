import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarReparaciones } from "../model/reparacion"

/**
 * Llave de caché de las reparaciones en ruta.
 *
 * @type {Array.<string>}
 */
export const LLAVE_REPARACIONES = ["reparaciones-ruta"]

/**
 * Trae todas las reparaciones en ruta con sus documentos.
 *
 * @endpoint POST roadside_repairs.php · op=getAll
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las reparaciones normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerReparaciones(opciones = {}) {
  const filas = await postLista(ENDPOINTS.reparacionesRuta, "getAll", { signal: opciones.signal })
  const { reparaciones, descartados } = normalizarReparaciones(filas)

  if (descartados > 0) {
    console.warn(`roadside_repairs.php#getAll descartó ${descartados} reparación(es).`)
  }

  return reparaciones
}

/**
 * Guarda una reparación, nueva o existente.
 *
 * **`fecha_suceso` solo viaja si trae valor.** El UPDATE del backend solo toca la
 * columna si el campo llegó en el POST, para que un cliente que no la mande —la
 * app móvil, por ejemplo— no borre la fecha que ya estaba.
 *
 * @endpoint POST roadside_repairs.php · op=save
 * @param {object} datos Los campos de la reparación.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarReparacion(datos) {
  const { fecha_suceso: fechaSuceso, ...resto } = datos
  return post(ENDPOINTS.reparacionesRuta, "save", {
    ...resto,
    ...(fechaSuceso ? { fecha_suceso: fechaSuceso } : {}),
  })
}

/**
 * Elimina un documento adjunto de una reparación.
 *
 * @endpoint POST roadside_repairs.php · op=delete_doc
 * @param {string} documentoId Documento a borrar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function eliminarDocumento(documentoId) {
  return post(ENDPOINTS.reparacionesRuta, "delete_doc", { id_documento: documentoId })
}

/**
 * Reparaciones en ruta, cacheadas.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useReparaciones() {
  return useQuery({
    queryKey: LLAVE_REPARACIONES,
    queryFn: ({ signal }) => obtenerReparaciones({ signal }),
  })
}

/**
 * Guarda una reparación y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarReparacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarReparacion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_REPARACIONES }),
  })
}

/**
 * Elimina un documento y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarDocumentoReparacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarDocumento,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_REPARACIONES }),
  })
}
