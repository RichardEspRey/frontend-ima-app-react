import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, FRESCURA_CATALOGO_MS, post, postLista } from "../../../shared/api"

/**
 * Llave de caché de la lista de gastos generales.
 *
 * @type {Array}
 */
export const LLAVE_GASTOS = ["gastos"]

/**
 * Llave de caché de un gasto suelto.
 *
 * @param {string} idGasto Gasto a consultar.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveGasto = (idGasto) => ["gastos", idGasto]

/**
 * Todos los gastos generales, con sus renglones y sus tickets.
 *
 * La API los devuelve completos de una vez —1 638 al escribir esto—, así que
 * filtrar y ordenar se hace en el navegador y no hay ida y vuelta por página.
 *
 * @endpoint POST save_expense.php · op=getAllGastos
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los gastos, o `[]` si no hay.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerGastos(opciones = {}) {
  return postLista(ENDPOINTS.gastos, "getAllGastos", { signal: opciones.signal })
}

/**
 * Un gasto con todo su detalle, el que se va a editar.
 *
 * @endpoint POST save_expense.php · op=getGastoById
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.idGasto Gasto a consultar.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} El gasto.
 * @throws {Error} Si el gasto no existe.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerGasto({ idGasto, signal }) {
  const cuerpo = await post(ENDPOINTS.gastos, "getGastoById", { id_gasto: idGasto }, { signal })
  if (!cuerpo?.data) throw new Error("El gasto no existe o ya se eliminó.")
  return cuerpo.data
}

/**
 * Da de alta un gasto con sus renglones y sus archivos.
 *
 * @endpoint POST save_expense.php · op=Alta
 * @param {object} gasto Los campos del formulario, ya listos para la API.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el alta.
 */
export function crearGasto(gasto) {
  return post(ENDPOINTS.gastos, "Alta", gasto)
}

/**
 * Guarda los cambios de un gasto.
 *
 * @endpoint POST save_expense.php · op=updateExpense
 * @param {object} gasto Los campos del formulario, con su `id_gasto`.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function actualizarGasto(gasto) {
  return post(ENDPOINTS.gastos, "updateExpense", gasto)
}

/**
 * Pide uno de los catálogos del formulario de gastos.
 *
 * Los cuatro viven en el mismo endpoint y devuelven `{value, label}`, así que
 * comparten una sola función.
 *
 * @endpoint POST save_expense.php
 * @param {string} op La operación del catálogo.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} El catálogo, o `[]` si no vino.
 * @throws {ApiError} Si la petición falla.
 */
export const obtenerCatalogo = (op, opciones = {}) =>
  postLista(ENDPOINTS.gastos, op, { signal: opciones.signal })

/**
 * Los cuatro catálogos que alimentan el formulario de gastos.
 *
 * @readonly
 * @enum {string}
 */
export const CATALOGO_GASTOS = {
  TIPOS: "getExpenseTypes",
  CATEGORIAS: "getCategories",
  SUBCATEGORIAS: "getAllSubcategories",
  INVENTARIO: "getAllInventoryItems",
}

/**
 * Todos los gastos generales.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useGastos() {
  return useQuery({
    queryKey: LLAVE_GASTOS,
    queryFn: ({ signal }) => obtenerGastos({ signal }),
  })
}

/**
 * Un gasto suelto. No consulta hasta tener el id.
 *
 * @param {string} idGasto Gasto a consultar.
 * @returns {object} El resultado de `useQuery`.
 */
export function useGasto(idGasto) {
  return useQuery({
    queryKey: llaveGasto(idGasto),
    enabled: Boolean(idGasto),
    queryFn: ({ signal }) => obtenerGasto({ idGasto, signal }),
  })
}

/**
 * Uno de los catálogos del formulario.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte, así que
 * el modal de alta y la barra de filtros lo piden una sola vez entre los dos.
 *
 * @param {string} op Un valor de `CATALOGO_GASTOS`.
 * @returns {object} El resultado de `useQuery`.
 */
export function useCatalogoGastos(op) {
  return useQuery({
    queryKey: ["gastos", "catalogo", op],
    queryFn: ({ signal }) => obtenerCatalogo(op, { signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Da de alta un gasto y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearGasto() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: crearGasto,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_GASTOS }),
  })
}

/**
 * Guarda un gasto y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useActualizarGasto() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: actualizarGasto,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_GASTOS }),
  })
}
