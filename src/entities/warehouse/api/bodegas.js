import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Bodegas dadas de alta.
 *
 * @endpoint POST warehouses.php · op=getWarehouses
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerBodegas(opciones = {}) {
  return postLista(ENDPOINTS.warehouses, "getWarehouses", { campo: "warehouses", signal: opciones.signal })
}

/**
 * Bodegas dadas de alta.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useBodegas() {
  return useQuery({
    queryKey: ["bodegas"],
    queryFn: ({ signal }) => obtenerBodegas({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Da de alta una bodega desde el propio selector.
 *
 * @endpoint POST warehouses.php · op=CreateWarehouse
 * @param {string} nombre Nombre de la bodega.
 * @returns {Promise.<object>} La bodega creada, con su id.
 * @throws {ApiError} Si la API rechaza el alta.
 */
export async function crearBodega(nombre) {
  const cuerpo = await post(ENDPOINTS.warehouses, "CreateWarehouse", { nombre_almacen: nombre })
  return cuerpo?.warehouse
}

/**
 * Da de alta una bodega y refresca el catálogo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearBodega() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: crearBodega,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["bodegas"] }),
  })
}
