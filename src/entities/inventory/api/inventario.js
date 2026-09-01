import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"
import { normalizarArticulos } from "../model/articulo"

/**
 * Llave de caché del inventario.
 *
 * @type {Array.<string>}
 */
export const LLAVE_INVENTARIO = ["inventario"]

/**
 * Trae el inventario completo, ya cruzado con sus categorías.
 *
 * Ojo con el nombre de la operación: es `getFullInventoryList`, no `getAll`.
 * `inventory.php` responde "Operación no válida" ante cualquier otra.
 *
 * @endpoint POST inventory.php · op=getFullInventoryList
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los artículos normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerInventario(opciones = {}) {
  const filas = await postLista(ENDPOINTS.inventario, "getFullInventoryList", {
    signal: opciones.signal,
  })
  const { articulos, descartados } = normalizarArticulos(filas)

  if (descartados > 0) {
    console.warn(
      `inventory.php#getFullInventoryList devolvió ${descartados} artículo(s) inválidos; se omitieron.`,
    )
  }

  return articulos
}

/**
 * Inventario completo, cacheado.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useInventario() {
  return useQuery({
    queryKey: LLAVE_INVENTARIO,
    queryFn: ({ signal }) => obtenerInventario({ signal }),
  })
}
