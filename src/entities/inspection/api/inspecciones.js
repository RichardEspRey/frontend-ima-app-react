import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarInspecciones } from "../model/inspeccion"

/**
 * Llave de caché de las inspecciones.
 *
 * @type {Array.<string>}
 */
export const LLAVE_INSPECCIONES = ["inspecciones"]

/**
 * Trae todas las inspecciones con sus reportes y documentos.
 *
 * Los reportes llegan ya parseados en `reportes`; el campo `reportes_json` es la
 * misma información como cadena y no hace falta tocarlo.
 *
 * @endpoint POST inspecciones.php · op=getAll
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las inspecciones normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerInspecciones(opciones = {}) {
  const filas = await postLista(ENDPOINTS.inspecciones, "getAll", { signal: opciones.signal })
  const { inspecciones, descartados } = normalizarInspecciones(filas)

  if (descartados > 0) {
    console.warn(`inspecciones.php#getAll descartó ${descartados} inspección(es).`)
  }

  return inspecciones
}

/**
 * Guarda una inspección, nueva o existente.
 *
 * @endpoint POST inspecciones.php · op=save
 * @param {object} datos Los campos de la inspección.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarInspeccion(datos) {
  return post(ENDPOINTS.inspecciones, "save", datos)
}

/**
 * Trae el catálogo de descripciones de violación.
 *
 * @endpoint POST inspecciones.php · op=get_descriptions
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las descripciones.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerDescripciones(opciones = {}) {
  return postLista(ENDPOINTS.inspecciones, "get_descriptions", { signal: opciones.signal })
}

/**
 * Elimina un documento adjunto de una inspección.
 *
 * @endpoint POST inspecciones.php · op=delete_doc
 * @param {string} documentoId Documento a borrar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function eliminarDocumento(documentoId) {
  return post(ENDPOINTS.inspecciones, "delete_doc", { id_documento: documentoId })
}

/**
 * Inspecciones, cacheadas.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useInspecciones() {
  return useQuery({
    queryKey: LLAVE_INSPECCIONES,
    queryFn: ({ signal }) => obtenerInspecciones({ signal }),
  })
}

/**
 * Catálogo de descripciones. Se cachea más tiempo: cambia poco.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useDescripciones() {
  return useQuery({
    queryKey: ["inspecciones", "descripciones"],
    queryFn: ({ signal }) => obtenerDescripciones({ signal }),
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Guarda una inspección y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarInspeccion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarInspeccion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_INSPECCIONES }),
  })
}

/**
 * Elimina un documento y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarDocumentoInspeccion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarDocumento,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_INSPECCIONES }),
  })
}
