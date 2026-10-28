import { useEffect, useRef } from "react"
import { useAvisosDeInspecciones } from "../../../entities/maintenance-point"
import { sinAnunciar, useNotificaciones } from "../../../entities/notification"
import { PERMISOS, useSesion } from "../../../shared/auth"
import { notify } from "../../../shared/ui"
import sonidoNotificacion from "../../../assets/sounds/update.mp3"
import { INTERVALO_INSPECCIONES_MS } from "./useCampanaNotificaciones"

/**
 * Reproduce el sonido de notificación sin arriesgar la aplicación.
 *
 * `play()` devuelve una promesa que el navegador **rechaza** cuando bloquea el
 * audio —la política de reproducción automática exige que la persona haya
 * interactuado antes con la página—. Sin este `catch`, ese rechazo llega al
 * manejador global de errores y la persona ve un aviso de fallo por algo que no
 * pidió y que no significa nada. Que no suene es aceptable; que aparezca un
 * error, no.
 *
 * @returns {void}
 */
function sonar() {
  try {
    const audio = new Audio(sonidoNotificacion)
    audio.play().catch(() => {})
  } catch {
    return
  }
}

/**
 * Anuncia las notificaciones nuevas mientras la persona trabaja.
 *
 * Se monta una sola vez, en el layout, y no pinta nada: su trabajo es mirar lo
 * que trae la entidad y avisar de lo que todavía no se ha visto.
 *
 * Va como aviso flotante y no como diálogo a propósito. Una notificación llega
 * sola, sin que nadie la haya pedido, así que taparle la pantalla a quien está
 * capturando un gasto sería exactamente el anti-patrón que el estándar prohíbe.
 * El aviso aparece arriba a la derecha y se va solo.
 *
 * Los identificadores ya anunciados viven en un `ref` y no en estado: cambiarlos
 * no tiene que repintar nada, y guardarlos en `useState` provocaría un ciclo de
 * render por cada notificación.
 *
 * El reinicio al cambiar de persona va **dentro del mismo efecto**, y no en uno
 * aparte, porque dos efectos separados dependen del orden en que React los
 * ejecuta y de que la lista cambie de referencia. Si no cambiara, quien entra
 * después heredaría los avisos ya callados del anterior.
 *
 * Las inspecciones que llegan a Reparaciones también se anuncian, pero no las que
 * ya estaban la primera vez que se consultan: eso sería anunciar el historial
 * entero al entrar.
 *
 * @param {string} [idUsuario] Identificador de la persona conectada.
 * @returns {Array.<object>} Las notificaciones actuales, por si la pantalla las quiere.
 *
 * @example
 * function DashboardLayout() {
 *   const { user } = useAuthStore()
 *   useAvisoDeNotificaciones(user?.id)
 *   return <Outlet />
 * }
 */
export function useAvisoDeNotificaciones(idUsuario) {
  const { data: notificaciones } = useNotificaciones(idUsuario)
  const anunciadas = useRef(new Set())
  const personaAnterior = useRef(idUsuario)
  const { can } = useSesion()
  const { avisos: inspecciones, cargados } = useAvisosDeInspecciones({
    enabled: Boolean(idUsuario) && can(PERMISOS.MANT_INSPECCION_FINAL),
    refetchInterval: INTERVALO_INSPECCIONES_MS,
  })
  const inspeccionesConocidas = useRef(null)
  const inspeccionesDe = useRef(idUsuario)

  useEffect(() => {
    if (personaAnterior.current !== idUsuario) {
      personaAnterior.current = idUsuario
      anunciadas.current = new Set()
    }

    if (!notificaciones?.length) return

    const nuevas = sinAnunciar(notificaciones, anunciadas.current)
    if (nuevas.length === 0) return

    for (const una of nuevas) {
      anunciadas.current.add(una.id)
      notify.discreto(una.mensaje, "info")
    }

    sonar()
  }, [notificaciones, idUsuario])

  useEffect(() => {
    if (inspeccionesDe.current !== idUsuario) {
      inspeccionesDe.current = idUsuario
      inspeccionesConocidas.current = null
    }

    if (!cargados) return

    if (inspeccionesConocidas.current) {
      const nuevas = sinAnunciar(inspecciones, inspeccionesConocidas.current)
      for (const una of nuevas) {
        notify.discreto(`Nueva inspección #${una.clFinalId} · ${una.operador}`, "info")
      }
      if (nuevas.length > 0) sonar()
    }

    inspeccionesConocidas.current = new Set(inspecciones.map((una) => una.id))
  }, [inspecciones, cargados, idUsuario])

  return notificaciones ?? []
}
