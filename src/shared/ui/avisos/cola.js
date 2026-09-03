import { create } from "zustand"

/**
 * Cuánto dura en pantalla un aviso flotante.
 *
 * @readonly
 * @type {number}
 */
export const DURACION_FLOTANTE_MS = 5000

let siguienteId = 1

/**
 * La cola de avisos pendientes de pintar.
 *
 * Es un store de zustand y no un módulo con estado suelto porque el proyecto ya
 * tiene tres stores así, y tener dos mecanismos para lo mismo es la clase de
 * duplicación que el estándar manda evitar. Zustand resuelve además, de fábrica,
 * lo que aquí había que escribir a mano: se lee y se escribe **fuera de React**
 * con `getState`, que es justo lo que necesita `notify` para poder llamarse
 * desde un `catch`, y `useStore` da la suscripción para pintar.
 *
 * Tres ranuras, separadas a propósito:
 *
 * - `cola`: los diálogos que esperan respuesta. Se muestran de uno en uno y por
 *   orden; el segundo espera en vez de reemplazar al primero, porque perder un
 *   aviso es peor que mostrar dos seguidos.
 * - `cargando`: el indicador que bloquea. No espera respuesta, así que no entra
 *   en la cola, y cualquier diálogo nuevo lo releva.
 * - `flotantes`: los avisos que no bloquean. Conviven y se van solos.
 */
export const usarCola = create(() => ({
  cola: [],
  cargando: null,
  flotantes: [],
}))

/**
 * Encola un diálogo y espera a que la persona responda.
 *
 * Cierra el indicador de carga si lo hay: es el comportamiento que tenía
 * sweetalert2 —un diálogo nuevo reemplazaba al anterior— y del que dependen las
 * pantallas que abren «Guardando…» y terminan mostrando el resultado sin cerrar
 * el indicador a mano.
 *
 * @param {object} peticion El diálogo a mostrar.
 * @returns {Promise.<*>} El valor de la acción elegida.
 */
export function pedir(peticion) {
  return new Promise((resolver) => {
    usarCola.setState((estado) => ({
      cargando: null,
      cola: [...estado.cola, { ...peticion, id: siguienteId++, resolver }],
    }))
  })
}

/**
 * Responde al diálogo indicado y lo saca de la cola.
 *
 * @param {number} id Identificador del diálogo.
 * @param {*} valor Lo que devuelve la promesa de `pedir`.
 * @returns {void}
 */
export function responder(id, valor) {
  const peticion = usarCola.getState().cola.find((una) => una.id === id)
  if (!peticion) return

  usarCola.setState((estado) => ({ cola: estado.cola.filter((una) => una.id !== id) }))
  peticion.resolver(valor)
}

/**
 * Abre el indicador de carga que bloquea la pantalla.
 *
 * @param {string} titulo Qué se está haciendo.
 * @returns {void}
 */
export function abrirCargando(titulo) {
  usarCola.setState({ cargando: { titulo } })
}

/**
 * Cierra el indicador de carga y el diálogo que esté abierto.
 *
 * @returns {void}
 */
export function cerrarAbierto() {
  const [peticion] = usarCola.getState().cola

  usarCola.setState((estado) => ({ cargando: null, cola: estado.cola.slice(1) }))
  peticion?.resolver(undefined)
}

/**
 * Encola un aviso flotante, de los que se van solos.
 *
 * El temporizador vive aquí y no en el componente para que el aviso se retire
 * —y su promesa se resuelva— aunque nadie lo esté pintando.
 *
 * @param {object} aviso El aviso a mostrar.
 * @param {number} [duracion=DURACION_FLOTANTE_MS] Milisegundos en pantalla.
 * @returns {Promise} Se resuelve cuando el aviso desaparece.
 */
export function anunciar(aviso, duracion = DURACION_FLOTANTE_MS) {
  return new Promise((resolver) => {
    const id = siguienteId++
    usarCola.setState((estado) => ({
      flotantes: [...estado.flotantes, { ...aviso, id, resolver }],
    }))
    setTimeout(() => retirar(id), duracion)
  })
}

/**
 * Retira un aviso flotante.
 *
 * @param {number} id Identificador del aviso.
 * @returns {void}
 */
export function retirar(id) {
  const aviso = usarCola.getState().flotantes.find((uno) => uno.id === id)
  if (!aviso) return

  usarCola.setState((estado) => ({ flotantes: estado.flotantes.filter((uno) => uno.id !== id) }))
  aviso.resolver(undefined)
}

/**
 * Vacía la cola sin resolver nada. Existe para aislar las pruebas entre sí.
 *
 * @returns {void}
 */
export function reiniciar() {
  usarCola.setState({ cola: [], cargando: null, flotantes: [] })
}
