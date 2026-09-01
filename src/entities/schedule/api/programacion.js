import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { programacionParaGuardar } from "../model/programacion"

/**
 * Llave de caché del tablero de disponibilidad.
 *
 * @type {Array}
 */
export const LLAVE_TABLERO = ["programacion", "tablero"]

/**
 * Llave de caché de las programaciones guardadas.
 *
 * @type {Array}
 */
export const LLAVE_PROGRAMACIONES = ["programacion", "lista"]

/**
 * Camiones, operadores y cajas con su disponibilidad.
 *
 * Es lo que alimenta los selectores del modal: quién y qué está libre para
 * programarse, y dónde está cada camión.
 *
 * @endpoint POST Programacion_viajes.php · op=dashboard
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<object>} `{camiones, operadores, cajas, cajasExternas}`.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerTableroProgramacion(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.programacionViajes, "dashboard", {}, opciones)
  const lista = (valor) => (Array.isArray(valor) ? valor : [])

  return {
    camiones: lista(cuerpo?.trucks),
    operadores: lista(cuerpo?.drivers),
    cajas: lista(cuerpo?.cajas),
    cajasExternas: lista(cuerpo?.cajas_externas),
  }
}

/**
 * Las programaciones guardadas, pendientes de convertirse en viaje.
 *
 * @endpoint POST Programacion_viajes.php · op=getAll
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si no hay ninguna.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerProgramaciones(opciones = {}) {
  return postLista(ENDPOINTS.programacionViajes, "getAll", { signal: opciones.signal })
}

/**
 * Guarda una programación, nueva o existente.
 *
 * @endpoint POST Programacion_viajes.php · op=insert | update
 * @param {object} parametros Datos del guardado.
 * @param {object} parametros.formulario El formulario del modal.
 * @param {(string|null)} [parametros.id] Id de la programación al editar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarProgramacion({ formulario, id = null }) {
  const editando = id !== null && id !== undefined

  return post(ENDPOINTS.programacionViajes, editando ? "update" : "insert", {
    ...(editando ? { id } : {}),
    ...programacionParaGuardar(formulario),
  })
}

/**
 * Elimina una programación.
 *
 * @endpoint POST Programacion_viajes.php · op=delete
 * @param {string} id La programación a borrar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el borrado.
 */
export function eliminarProgramacion(id) {
  return post(ENDPOINTS.programacionViajes, "delete", { id })
}

/**
 * El tablero de disponibilidad. No consulta hasta que se necesita.
 *
 * @param {boolean} [habilitada=true] Si debe consultarse.
 * @returns {object} El resultado de `useQuery`.
 */
export function useTableroProgramacion(habilitada = true) {
  return useQuery({
    queryKey: LLAVE_TABLERO,
    enabled: habilitada,
    queryFn: ({ signal }) => obtenerTableroProgramacion({ signal }),
  })
}

/**
 * Las programaciones guardadas.
 *
 * @param {boolean} [habilitada=true] Si debe consultarse.
 * @returns {object} El resultado de `useQuery`.
 */
export function useProgramaciones(habilitada = true) {
  return useQuery({
    queryKey: LLAVE_PROGRAMACIONES,
    enabled: habilitada,
    queryFn: ({ signal }) => obtenerProgramaciones({ signal }),
  })
}

/**
 * Guarda una programación y refresca la lista y el tablero.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarProgramacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarProgramacion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["programacion"] }),
  })
}

/**
 * Elimina una programación y refresca la lista y el tablero.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarProgramacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarProgramacion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["programacion"] }),
  })
}
