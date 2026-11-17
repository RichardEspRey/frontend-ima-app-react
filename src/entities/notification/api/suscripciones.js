import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"

/**
 * Raíz de las llaves de caché de las listas de avisos de avisos de `Notifications.php`.
 *
 * @type {Array.<string>}
 */
export const LLAVE_AVISOS = ["avisos"]

/**
 * Cada cuánto se vuelve a preguntar a qué avisos está suscrita la persona.
 *
 * @type {number}
 */
export const INTERVALO_MIS_CATEGORIAS_MS = 5 * 60_000

/**
 * Los avisos a los que está suscrita una persona.
 *
 * @endpoint POST Notifications.php · op=getMisCategorias
 * @param {object} parametros Datos de la consulta.
 * @param {(string|number)} parametros.idUsuario Identificador de la persona.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<string>>} Los valores de `CATEGORIA_AVISO` que recibe.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerMisCategorias({ idUsuario, signal }) {
  const cuerpo = await post(ENDPOINTS.notificaciones, "getMisCategorias", { user_id: idUsuario }, { signal })
  return Array.isArray(cuerpo?.categorias) ? cuerpo.categorias.map(String) : []
}

/**
 * A qué avisos está suscrita la persona, al día.
 *
 * No reintenta ni anuncia sus fallos: si esas operaciones no responden, quien lo usa
 * reparte los avisos por permiso de pantalla, como antes de que existieran las
 * listas.
 *
 * @param {(string|number)} [idUsuario] Identificador de la persona. Sin él no consulta.
 * @returns {object} El resultado de `useQuery`; `data` son las categorías.
 */
export function useMisCategorias(idUsuario) {
  return useQuery({
    queryKey: [...LLAVE_AVISOS, "mias", idUsuario],
    queryFn: ({ signal }) => obtenerMisCategorias({ idUsuario, signal }),
    enabled: Boolean(idUsuario),
    refetchInterval: INTERVALO_MIS_CATEGORIAS_MS,
    retry: false,
    meta: { silencioso: true },
  })
}

/**
 * Quiénes reciben un aviso.
 *
 * @endpoint POST Notifications.php · op=getSuscriptores
 * @param {string} categoria Un valor de `CATEGORIA_AVISO`.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Los suscriptores, o `[]`.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerSuscriptoresDeAviso(categoria, opciones = {}) {
  return postLista(ENDPOINTS.notificaciones, "getSuscriptores", {
    payload: { categoria },
    campo: "users",
    signal: opciones.signal,
  })
}

/**
 * Quiénes todavía no reciben un aviso.
 *
 * @endpoint POST Notifications.php · op=getDisponibles
 * @param {string} categoria Un valor de `CATEGORIA_AVISO`.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Los candidatos, o `[]`.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerDisponiblesDeAviso(categoria, opciones = {}) {
  return postLista(ENDPOINTS.notificaciones, "getDisponibles", {
    payload: { categoria },
    campo: "users",
    signal: opciones.signal,
  })
}

/**
 * Da de alta a una persona en un aviso.
 *
 * @endpoint POST Notifications.php · op=suscribir
 * @param {object} parametros Datos del alta.
 * @param {string} parametros.categoria Un valor de `CATEGORIA_AVISO`.
 * @param {(string|number)} parametros.userId A quién se suscribe.
 * @param {(string|number)} [parametros.usuarioId] Quién lo da de alta.
 * @returns {Promise.<object>} La respuesta del servidor.
 * @throws {ApiError} Si la petición falla.
 */
export function suscribirAAviso({ categoria, userId, usuarioId }) {
  return post(ENDPOINTS.notificaciones, "suscribir", { categoria, user_id: userId, id_usuario: usuarioId })
}

/**
 * Da de baja a una persona de un aviso.
 *
 * @endpoint POST Notifications.php · op=desuscribir
 * @param {object} parametros Datos de la baja.
 * @param {string} parametros.categoria Un valor de `CATEGORIA_AVISO`.
 * @param {(string|number)} parametros.userId A quién se da de baja.
 * @returns {Promise.<object>} La respuesta del servidor.
 * @throws {ApiError} Si la petición falla.
 */
export function desuscribirDeAviso({ categoria, userId }) {
  return post(ENDPOINTS.notificaciones, "desuscribir", { categoria, user_id: userId })
}

/**
 * Los cuatro hooks con los que se administra la lista de un aviso.
 *
 * Tienen la misma forma que los de BL y los de inspecciones, para que la
 * tarjeta de Notificaciones manager no distinga de dónde sale cada lista. Tras
 * un alta o una baja se refrescan todas las llaves de `avisos`, incluida la de
 * «mis categorías»: quien se suscribe a sí mismo lo nota sin esperar al sondeo.
 *
 * @param {string} categoria Un valor de `CATEGORIA_AVISO`.
 * @returns {{useSuscriptores: Function, useDisponibles: Function, useSuscribir: Function, useDesuscribir: Function}} Los hooks de esa lista.
 *
 * @example
 * const { useSuscriptores } = hooksDeAviso(CATEGORIA_AVISO.DIESEL_STATE)
 */
export function hooksDeAviso(categoria) {
  return {
    useSuscriptores: () =>
      useQuery({
        queryKey: [...LLAVE_AVISOS, categoria, "suscriptores"],
        queryFn: ({ signal }) => obtenerSuscriptoresDeAviso(categoria, { signal }),
      }),
    useDisponibles: (habilitada = true) =>
      useQuery({
        queryKey: [...LLAVE_AVISOS, categoria, "disponibles"],
        queryFn: ({ signal }) => obtenerDisponiblesDeAviso(categoria, { signal }),
        enabled: habilitada,
      }),
    useSuscribir: () => {
      const cliente = useQueryClient()
      return useMutation({
        mutationFn: ({ userId, usuarioId }) => suscribirAAviso({ categoria, userId, usuarioId }),
        onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_AVISOS }),
      })
    },
    useDesuscribir: () => {
      const cliente = useQueryClient()
      return useMutation({
        mutationFn: ({ userId }) => desuscribirDeAviso({ categoria, userId }),
        onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_AVISOS }),
      })
    },
  }
}
