/**
 * Cuánto dura en pantalla un aviso flotante.
 *
 * @readonly
 * @type {number}
 */
export const DURACION_FLOTANTE_MS = 5000

let siguienteId = 1
let cola = []
let cargando = null
let flotantes = []
let instantanea = { actual: null, cargando: null, flotantes: [] }

const oyentes = new Set()

function publicar() {
  instantanea = { actual: cola[0] ?? null, cargando, flotantes }
  oyentes.forEach((oyente) => oyente())
}

/**
 * Escucha los cambios de la cola.
 *
 * @param {Function} oyente Se llama, sin argumentos, en cada cambio.
 * @returns {Function} La función que cancela la suscripción.
 */
export function suscribir(oyente) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

/**
 * Devuelve el estado actual de la cola.
 *
 * Devuelve siempre la **misma** referencia mientras nada cambie, que es lo que
 * `useSyncExternalStore` necesita para no repintar en bucle.
 *
 * @returns {{actual: (object|null), cargando: (object|null), flotantes: Array}} El estado.
 */
export function leer() {
  return instantanea
}

/**
 * Encola un diálogo y espera a que la persona responda.
 *
 * Si hay un indicador de carga abierto, lo cierra: es el comportamiento que
 * tenía sweetalert2 —un diálogo nuevo reemplazaba al anterior— y del que
 * dependen las pantallas que abren «Guardando…» y terminan mostrando el
 * resultado sin cerrar el indicador a mano.
 *
 * Si hay otro diálogo abierto, este espera su turno en vez de reemplazarlo.
 * Perder un aviso es peor que mostrar dos seguidos.
 *
 * @param {object} peticion El diálogo a mostrar.
 * @returns {Promise.<*>} El valor de la acción elegida.
 */
export function pedir(peticion) {
  return new Promise((resolver) => {
    cargando = null
    cola = [...cola, { ...peticion, id: siguienteId++, resolver }]
    publicar()
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
  const peticion = cola.find((una) => una.id === id)
  if (!peticion) return

  cola = cola.filter((una) => una.id !== id)
  publicar()
  peticion.resolver(valor)
}

/**
 * Abre el indicador de carga que bloquea la pantalla.
 *
 * Vive en su propia ranura, fuera de la cola, porque no espera respuesta y
 * porque cualquier diálogo posterior tiene que poder reemplazarlo.
 *
 * @param {string} titulo Qué se está haciendo.
 * @returns {void}
 */
export function abrirCargando(titulo) {
  cargando = { titulo }
  publicar()
}

/**
 * Cierra el indicador de carga y el diálogo que esté abierto.
 *
 * @returns {void}
 */
export function cerrarAbierto() {
  cargando = null
  const peticion = cola[0]
  if (peticion) cola = cola.slice(1)
  publicar()
  peticion?.resolver(undefined)
}

/**
 * Encola un aviso flotante, de los que se van solos.
 *
 * No pasan por la cola de diálogos: se apilan y conviven, porque no bloquean.
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
    flotantes = [...flotantes, { ...aviso, id, resolver }]
    publicar()
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
  const aviso = flotantes.find((uno) => uno.id === id)
  if (!aviso) return

  flotantes = flotantes.filter((uno) => uno.id !== id)
  publicar()
  aviso.resolver(undefined)
}

/**
 * Vacía la cola sin resolver nada. Existe para aislar las pruebas entre sí.
 *
 * @returns {void}
 */
export function reiniciar() {
  cola = []
  cargando = null
  flotantes = []
  publicar()
}
