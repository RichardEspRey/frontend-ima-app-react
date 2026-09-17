import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarNotificaciones } from "../model/notificaciones"

/**
 * Cada cuánto se le pregunta al servidor si hay notificaciones nuevas.
 *
 * Quince segundos es lo que ya usaba la app antes de este refactor. Se deja
 * igual para no cambiar dos cosas a la vez: si hay que ajustarlo, se ajusta
 * aquí y afecta a toda la aplicación.
 *
 * @type {number}
 */
export const INTERVALO_NOTIFICACIONES_MS = 15000

/**
 * Llave de caché de las notificaciones de una persona.
 *
 * @param {string} idUsuario Identificador de la persona.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveNotificaciones = (idUsuario) => ["notificaciones", idUsuario]

/**
 * Trae las notificaciones de una persona.
 *
 * @endpoint POST Notifications.php · op=getAll
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.idUsuario Identificador de la persona.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Las notificaciones válidas.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerNotificaciones({ idUsuario, signal }) {
  const cuerpo = await post(ENDPOINTS.notificaciones, "getAll", { user_id: idUsuario }, { signal })
  const { notificaciones, descartadas } = normalizarNotificaciones(cuerpo?.notifications)

  if (descartadas > 0) {
    console.warn(`Notifications.php#getAll descartó ${descartadas} notificación(es).`)
  }

  return notificaciones
}

/**
 * Mantiene al día las notificaciones de una persona.
 *
 * Sustituye al `setInterval` que vivía dentro del layout. La diferencia que
 * importa no es de estilo:
 *
 * - **Se detiene sola cuando la ventana no está al frente.** `refetchInterval`
 *   no dispara en segundo plano, así que una máquina con la app abierta y
 *   minimizada toda la tarde deja de pegarle al servidor. El `setInterval`
 *   seguía sondeando.
 * - **Cancela la petición en vuelo** al desmontarse o al cambiar de persona,
 *   en lugar de dejarla llegar tarde y escribir sobre estado que ya no existe.
 * - **No anuncia sus fallos.** Con `silencioso`, una racha sin red no llena la
 *   pantalla de avisos por algo que nadie pidió y que se arregla solo.
 *
 * @param {string} [idUsuario] Identificador de la persona. Sin él no consulta nada.
 * @returns {object} El resultado de `useQuery`; `data` es la lista de notificaciones.
 *
 * @example
 * const { data: notificaciones = [] } = useNotificaciones(user?.id)
 */
export function useNotificaciones(idUsuario) {
  return useQuery({
    queryKey: llaveNotificaciones(idUsuario),
    queryFn: ({ signal }) => obtenerNotificaciones({ idUsuario, signal }),
    enabled: Boolean(idUsuario),
    refetchInterval: INTERVALO_NOTIFICACIONES_MS,
    staleTime: 0,
    meta: { silencioso: true },
  })
}

/**
 * Llave de caché de quiénes reciben las notificaciones de viajes.
 *
 * @type {Array}
 */
export const LLAVE_SUSCRIPTORES = ["notificaciones", "suscriptores"]

/**
 * Llave de caché de quiénes todavía pueden suscribirse.
 *
 * @type {Array}
 */
export const LLAVE_DISPONIBLES = ["notificaciones", "disponibles"]

/**
 * Las personas que hoy reciben las notificaciones de viajes.
 *
 * @endpoint POST Notifications.php · op=getSubscribers
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Los suscriptores, o `[]`.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerSuscriptores(opciones = {}) {
  return postLista(ENDPOINTS.notificaciones, "getSubscribers", {
    campo: "users",
    signal: opciones.signal,
  })
}

/**
 * Las personas que todavía no reciben las notificaciones de viajes.
 *
 * @endpoint POST Notifications.php · op=getAvailableUsers
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Los candidatos, o `[]`.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerUsuariosDisponibles(opciones = {}) {
  return postLista(ENDPOINTS.notificaciones, "getAvailableUsers", {
    campo: "users",
    signal: opciones.signal,
  })
}

/**
 * Da de alta a una persona en las notificaciones de viajes.
 *
 * @endpoint POST Notifications.php · op=subscribe
 * @param {(string|number)} idUsuario A quién se suscribe.
 * @returns {Promise.<object>} La respuesta del servidor.
 * @throws {ApiError} Si la petición falla.
 */
export function suscribir(idUsuario) {
  return post(ENDPOINTS.notificaciones, "subscribe", { user_id: idUsuario })
}

/**
 * Da de baja a una persona de las notificaciones de viajes.
 *
 * @endpoint POST Notifications.php · op=unsubscribe
 * @param {(string|number)} idUsuario A quién se da de baja.
 * @returns {Promise.<object>} La respuesta del servidor.
 * @throws {ApiError} Si la petición falla.
 */
export function desuscribir(idUsuario) {
  return post(ENDPOINTS.notificaciones, "unsubscribe", { user_id: idUsuario })
}

/**
 * Quiénes reciben hoy las notificaciones de viajes.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useSuscriptores() {
  return useQuery({
    queryKey: LLAVE_SUSCRIPTORES,
    queryFn: ({ signal }) => obtenerSuscriptores({ signal }),
  })
}

/**
 * Quiénes pueden suscribirse. No consulta hasta que hace falta la lista.
 *
 * @param {boolean} [habilitada] Si la lista está a la vista.
 * @returns {object} El resultado de `useQuery`.
 */
export function useUsuariosDisponibles(habilitada = true) {
  return useQuery({
    queryKey: LLAVE_DISPONIBLES,
    queryFn: ({ signal }) => obtenerUsuariosDisponibles({ signal }),
    enabled: habilitada,
  })
}

/**
 * Invalida las dos listas: quien entra a una sale de la otra.
 *
 * @param {object} cliente El cliente de TanStack Query.
 * @returns {Promise} Cuando ambas quedan marcadas para recargarse.
 */
function refrescarListas(cliente) {
  return Promise.all([
    cliente.invalidateQueries({ queryKey: LLAVE_SUSCRIPTORES }),
    cliente.invalidateQueries({ queryKey: LLAVE_DISPONIBLES }),
  ])
}

/**
 * Suscribe a una persona y refresca las dos listas.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useSuscribir() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: suscribir,
    onSuccess: () => refrescarListas(cliente),
  })
}

/**
 * Da de baja a una persona y refresca las dos listas.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useDesuscribir() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: desuscribir,
    onSuccess: () => refrescarListas(cliente),
  })
}
