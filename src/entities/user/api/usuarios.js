import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarUsuarios } from "../model/usuario"

/**
 * Llave de caché de la lista de usuarios.
 *
 * @type {Array.<string>}
 */
export const LLAVE_USUARIOS = ["usuarios"]

/**
 * Trae todos los usuarios del sistema, sin sus contraseñas.
 *
 * El endpoint las devuelve en claro; el esquema no las incluye, así que no
 * llegan al estado de la aplicación. Ver `entities/user/model/usuario.js`.
 *
 * @endpoint POST features.php · op=get_users
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Usuarios normalizados, con su rol canónico.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerUsuarios(opciones = {}) {
  const filas = await postLista(ENDPOINTS.features, "get_users", {
    campo: "users",
    signal: opciones.signal,
  })
  const { usuarios, descartados } = normalizarUsuarios(filas)
  if (descartados > 0) {
    console.warn(`features.php#get_users devolvió ${descartados} registro(s) inválidos; se omitieron.`)
  }
  return usuarios
}

/**
 * Da de alta un usuario.
 *
 * @endpoint POST features.php · op=create_user
 * @param {object} datos Nombre, usuario, contraseña, tipo y conductor asociado.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function crearUsuario(datos) {
  return post(ENDPOINTS.features, "create_user", {
    name: datos.name,
    user: datos.user,
    pass: datos.pass,
    type: datos.type,
    driver_id: datos.type === "Driver" ? datos.driver_id : "",
  })
}

/**
 * Actualiza un usuario.
 *
 * `pass` solo viaja si trae algo: vacío significa "no cambiar la contraseña", y
 * el backend no toca el campo si no lo recibe.
 *
 * @endpoint POST features.php · op=update_user
 * @param {object} parametros Datos de la edición.
 * @param {string} parametros.userId Identificador del usuario.
 * @param {object} parametros.datos Campos a guardar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function actualizarUsuario({ userId, datos }) {
  return post(ENDPOINTS.features, "update_user", {
    user_id: userId,
    name: datos.name,
    user: datos.user,
    type: datos.type,
    active: datos.active,
    driver_id: datos.type === "Driver" ? datos.driver_id : "",
    ...(datos.pass ? { pass: datos.pass } : {}),
  })
}

/**
 * Lista de usuarios, cacheada.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useUsuarios() {
  return useQuery({
    queryKey: LLAVE_USUARIOS,
    queryFn: ({ signal }) => obtenerUsuarios({ signal }),
  })
}

/**
 * Crea un usuario y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearUsuario() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_USUARIOS }),
  })
}

/**
 * Actualiza un usuario y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useActualizarUsuario() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: actualizarUsuario,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_USUARIOS }),
  })
}
