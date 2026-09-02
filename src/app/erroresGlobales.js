import { ApiError } from "../shared/api/errors"
import { notify } from "../shared/ui/notify"

/**
 * Cuánto tiempo se calla un mensaje repetido, en milisegundos.
 *
 * Un fallo suele venir en ráfaga: una pantalla con seis consultas contra un
 * servidor caído produce seis rechazos idénticos en el mismo segundo. Seis
 * avisos apilados no informan seis veces más; tapan la pantalla y esconden el
 * botón que haría falta pulsar.
 *
 * @readonly
 * @type {number}
 */
export const SILENCIO_REPETIDO_MS = 5000

const ultimoAviso = new Map()

/**
 * Indica si este mensaje ya se avisó hace muy poco.
 *
 * @param {string} mensaje El texto del aviso.
 * @param {number} [ahora] Momento actual, inyectable para las pruebas.
 * @returns {boolean} `true` si toca callarse.
 */
export function esRepetido(mensaje, ahora = Date.now()) {
  const previo = ultimoAviso.get(mensaje)
  if (previo !== undefined && ahora - previo < SILENCIO_REPETIDO_MS) return true
  ultimoAviso.set(mensaje, ahora)
  return false
}

/**
 * Olvida los avisos recordados. Solo para las pruebas.
 *
 * @returns {void}
 */
export const olvidarAvisos = () => ultimoAviso.clear()

/**
 * Qué decir cuando algo falla fuera del árbol de React.
 *
 * @param {*} error Lo que se rechazó o se lanzó.
 * @returns {(string|null)} El texto a mostrar, o `null` si no hay que decir nada.
 */
export function mensajeDeFallo(error) {
  if (error instanceof ApiError) {
    return error.fueCancelada ? null : error.message
  }

  if (error instanceof TypeError && /fetch/i.test(error.message ?? "")) {
    return "No se pudo conectar con el servidor. Revisa tu conexión."
  }

  return "Algo falló en segundo plano. Si la pantalla se comporta raro, recárgala."
}

/**
 * Avisa de un fallo, si hay algo que decir y no se acaba de decir.
 *
 * Usa el aviso discreto y no el diálogo: esto se dispara por cosas que la
 * persona no pidió —una consulta de fondo, una promesa rechazada—, y un diálogo
 * con botón la obligaría a descartar un mensaje sobre algo que ni siquiera
 * estaba mirando, tapando de paso lo que sí cargó bien.
 *
 * Es el único punto por el que sale un aviso de fallo no atrapado, venga de una
 * promesa rechazada o de una consulta que ninguna pantalla miró. Que sea uno
 * solo es lo que hace que la deduplicación funcione: si cada origen tuviera la
 * suya, una caída de red seguiría apilando avisos.
 *
 * @param {*} error Lo que falló.
 * @returns {void}
 */
export function avisarDeFallo(error) {
  const mensaje = mensajeDeFallo(error)
  if (mensaje && !esRepetido(mensaje)) notify.discreto(mensaje)
}

/**
 * Instala los manejadores de lo que se escapa de todo lo demás.
 *
 * El `ErrorBoundary` atrapa los fallos de render y la capa de API atrapa los de
 * las peticiones. Fuera de eso queda una franja: una promesa rechazada sin
 * `catch`, un error dentro de un `setTimeout`. Hoy eso solo llega a la consola,
 * que nadie mira, y la persona se queda con un botón que no hizo nada y sin
 * ninguna pista de por qué.
 *
 * No convierte el fallo en pantalla de error: avisa y deja seguir. Lo que se
 * escapa por aquí casi nunca invalida el resto de la pantalla.
 *
 * Las cancelaciones se ignoran: cambiar de pantalla con una petición en vuelo
 * produce un rechazo que no es un fallo, y avisar de eso sería ruido constante.
 *
 * @param {object} [ventana=window] La ventana donde instalar, inyectable para pruebas.
 * @returns {Function} Función para desinstalar los manejadores.
 */
export function instalarErroresGlobales(ventana = window) {
  const alRechazar = (evento) => {
    console.error("Promesa rechazada sin manejar:", evento.reason)
    avisarDeFallo(evento.reason)
  }

  const alFallar = (evento) => {
    console.error("Error no capturado:", evento.error ?? evento.message)
    avisarDeFallo(evento.error)
  }

  ventana.addEventListener("unhandledrejection", alRechazar)
  ventana.addEventListener("error", alFallar)

  return () => {
    ventana.removeEventListener("unhandledrejection", alRechazar)
    ventana.removeEventListener("error", alFallar)
  }
}
