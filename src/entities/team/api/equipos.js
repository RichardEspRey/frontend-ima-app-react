import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"

/**
 * Llave de caché de la lista de equipos.
 *
 * @type {Array.<string>}
 */
export const LLAVE_EQUIPOS = ["equipos"]

/**
 * Llave de caché de los miembros de un equipo.
 *
 * @param {string} teamId Identificador del equipo.
 * @returns {Array.<string>} La llave para `useQuery`.
 */
export const llaveMiembros = (teamId) => ["equipos", "miembros", String(teamId)]

/**
 * Trae todos los equipos.
 *
 * @endpoint POST teams.php · op=get_teams
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los equipos.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerEquipos(opciones = {}) {
  return postLista(ENDPOINTS.teams, "get_teams", { signal: opciones.signal })
}

/**
 * Trae los identificadores de los miembros de un equipo.
 *
 * @endpoint POST teams.php · op=get_team_users
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.teamId Identificador del equipo.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<string>>} Los ids de los miembros.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerMiembros({ teamId, signal }) {
  const ids = await postLista(ENDPOINTS.teams, "get_team_users", {
    payload: { team_id: teamId },
    signal,
  })
  return ids.map(String)
}

/**
 * Crea un equipo.
 *
 * @endpoint POST teams.php · op=create_team
 * @param {object} datos Nombre y descripción.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function crearEquipo(datos) {
  return post(ENDPOINTS.teams, "create_team", {
    name: datos.name,
    description: datos.description,
  })
}

/**
 * Renombra o redescribe un equipo.
 *
 * @endpoint POST teams.php · op=edit_team
 * @param {object} parametros Datos de la edición.
 * @param {string} parametros.teamId Identificador del equipo.
 * @param {object} parametros.datos Nombre y descripción nuevos.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function editarEquipo({ teamId, datos }) {
  return post(ENDPOINTS.teams, "edit_team", {
    team_id: teamId,
    name: datos.name,
    description: datos.description,
  })
}

/**
 * Elimina un equipo. No borra a sus miembros, solo la agrupación.
 *
 * @endpoint POST teams.php · op=delete_team
 * @param {string} teamId Identificador del equipo.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function eliminarEquipo(teamId) {
  return post(ENDPOINTS.teams, "delete_team", { team_id: teamId })
}

/**
 * Reemplaza por completo la lista de miembros de un equipo.
 *
 * No es incremental: manda la lista final, así que un id que falte queda fuera
 * del equipo.
 *
 * @endpoint POST teams.php · op=save_team_users
 * @param {object} parametros Datos a guardar.
 * @param {string} parametros.teamId Identificador del equipo.
 * @param {Array.<string>} parametros.miembros Ids de los miembros finales.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarMiembros({ teamId, miembros }) {
  return post(ENDPOINTS.teams, "save_team_users", {
    team_id: teamId,
    users: miembros,
  })
}

/**
 * Lista de equipos, cacheada.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useEquipos() {
  return useQuery({
    queryKey: LLAVE_EQUIPOS,
    queryFn: ({ signal }) => obtenerEquipos({ signal }),
  })
}

/**
 * Miembros de un equipo. No consulta hasta tener un equipo seleccionado.
 *
 * @param {(string|undefined)} teamId Identificador del equipo.
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useMiembros(teamId) {
  return useQuery({
    queryKey: llaveMiembros(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) => obtenerMiembros({ teamId, signal }),
  })
}

/**
 * Crea un equipo y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearEquipo() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: crearEquipo,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_EQUIPOS }),
  })
}

/**
 * Edita un equipo y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEditarEquipo() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: editarEquipo,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_EQUIPOS }),
  })
}

/**
 * Elimina un equipo y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarEquipo() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarEquipo,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_EQUIPOS }),
  })
}

/**
 * Guarda los miembros de un equipo y refresca ese equipo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarMiembros() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarMiembros,
    onSuccess: (_datos, variables) =>
      cliente.invalidateQueries({ queryKey: llaveMiembros(variables.teamId) }),
  })
}
