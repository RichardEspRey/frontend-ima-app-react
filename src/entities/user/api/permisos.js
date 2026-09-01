import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"

/**
 * Plataformas para las que se conceden permisos.
 *
 * La app móvil consume los mismos endpoints y tiene su propio juego de permisos,
 * por eso cada `feature` viaja con su plataforma.
 *
 * @readonly
 * @enum {string}
 */
export const PLATAFORMA = {
  ESCRITORIO: "Desktop",
  MOVIL: "Mobile",
}

/**
 * Llave de caché de los permisos de un usuario.
 *
 * @param {string} userId Identificador del usuario.
 * @returns {Array.<string>} La llave para `useQuery`.
 */
export const llavePermisosUsuario = (userId) => ["usuarios", "permisos", String(userId)]

/**
 * Trae todos los permisos de un usuario, separados por plataforma.
 *
 * @endpoint POST features.php · op=get_all_user_features
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.userId Identificador del usuario.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} `{escritorio, movil}`, cada uno una lista de permisos.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPermisosUsuario({ userId, signal }) {
  const features = await postLista(ENDPOINTS.features, "get_all_user_features", {
    campo: "features",
    payload: { user_id: userId },
    signal,
  })

  return {
    escritorio: features.filter((f) => f.app === PLATAFORMA.ESCRITORIO),
    movil: features.filter((f) => f.app === PLATAFORMA.MOVIL),
  }
}

/**
 * Concede o quita un permiso a un usuario.
 *
 * @endpoint POST features.php · op=toggle_user_feature
 * @param {object} parametros Datos del cambio.
 * @param {string} parametros.userId Usuario afectado.
 * @param {string} parametros.featureId Permiso a cambiar.
 * @param {string} parametros.plataforma `Desktop` o `Mobile`.
 * @param {boolean} parametros.concedido Si queda habilitado.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function cambiarPermisoUsuario({ userId, featureId, plataforma, concedido }) {
  return post(ENDPOINTS.features, "toggle_user_feature", {
    user_id: userId,
    feature_id: featureId,
    app: plataforma,
    enabled: concedido ? 1 : 0,
  })
}

/**
 * Permisos de un usuario. No consulta hasta tener un usuario.
 *
 * @param {(string|undefined)} userId Identificador del usuario.
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function usePermisosUsuario(userId) {
  return useQuery({
    queryKey: llavePermisosUsuario(userId),
    enabled: Boolean(userId),
    queryFn: ({ signal }) => obtenerPermisosUsuario({ userId, signal }),
  })
}

/**
 * Cambia un permiso y refresca los del usuario afectado.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCambiarPermisoUsuario() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: cambiarPermisoUsuario,
    onSuccess: (_datos, variables) =>
      cliente.invalidateQueries({ queryKey: llavePermisosUsuario(variables.userId) }),
  })
}
