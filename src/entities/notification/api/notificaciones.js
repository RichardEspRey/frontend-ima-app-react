import { useQuery } from "@tanstack/react-query"
import { post } from "../../../shared/api"
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
  const cuerpo = await post("Notifications.php", "getAll", { user_id: idUsuario }, { signal })
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
