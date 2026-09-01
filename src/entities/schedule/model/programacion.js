/**
 * Prefijos con los que se distingue una caja propia de una externa en el selector.
 *
 * El selector de caja mezcla las dos flotas en una sola lista, y sus ids se
 * repiten entre tablas: la caja interna 5 y la externa 5 son distintas. El
 * prefijo es lo que las separa mientras están juntas.
 *
 * @readonly
 * @enum {string}
 */
export const PREFIJO_CAJA = {
  INTERNA: "i_",
  EXTERNA: "e_",
}

/**
 * El valor con el que una caja se identifica dentro del selector.
 *
 * @param {(string|number)} id El id de la caja.
 * @param {boolean} externa Si es de la flota externa.
 * @returns {string} El valor con su prefijo.
 */
export const valorCaja = (id, externa) =>
  `${externa ? PREFIJO_CAJA.EXTERNA : PREFIJO_CAJA.INTERNA}${id}`

/**
 * Descompone el valor del selector en el id y de qué flota es.
 *
 * @param {string} [valor] Lo que trae el selector.
 * @returns {{id: string, externa: boolean}} El id sin prefijo y de qué flota es.
 */
export function leerValorCaja(valor = "") {
  const texto = String(valor ?? "")
  return {
    id: texto ? texto.replace(/^[ie]_/, "") : "",
    externa: texto.startsWith(PREFIJO_CAJA.EXTERNA),
  }
}

/**
 * Una programación en blanco, la que abre el modal al dar de alta.
 *
 * @returns {object} El formulario vacío.
 */
export const programacionEnBlanco = () => ({
  operador_id: "",
  camion_id: "",
  caja_id: "",
  company_id: "",
  destino: "",
  salida: "",
})

/**
 * Convierte una programación guardada en el formulario que la edita.
 *
 * @param {object} programacion La fila guardada.
 * @returns {object} El formulario con sus valores.
 */
export function formularioDesdePrograma(programacion) {
  const caja = programacion?.caja_externa_id
    ? valorCaja(programacion.caja_externa_id, true)
    : programacion?.caja_id
      ? valorCaja(programacion.caja_id, false)
      : ""

  return {
    operador_id: programacion?.driver_id ? String(programacion.driver_id) : "",
    camion_id: programacion?.truck_id ? String(programacion.truck_id) : "",
    caja_id: caja,
    company_id: programacion?.company_id ? String(programacion.company_id) : "",
    destino: programacion?.destino || "",
    salida: programacion?.salida ? programacion.salida.slice(0, 16) : "",
  }
}

/**
 * Los campos que se mandan al guardar una programación.
 *
 * La caja viaja en uno u otro campo según de qué flota sea; el que no aplica va
 * vacío, no ausente, porque así es como se borra la asignación anterior.
 *
 * @param {object} formulario El formulario del modal.
 * @returns {object} Los campos para la API.
 */
export function programacionParaGuardar(formulario) {
  const { id, externa } = leerValorCaja(formulario?.caja_id)

  return {
    driver_id: formulario?.operador_id ?? "",
    truck_id: formulario?.camion_id ?? "",
    caja_id: externa ? "" : id,
    caja_externa_id: externa ? id : "",
    company_id: formulario?.company_id ?? "",
    destino: formulario?.destino ?? "",
    salida: formulario?.salida ?? "",
  }
}

/**
 * Comprueba que la programación tenga lo mínimo para guardarse.
 *
 * @param {object} formulario El formulario del modal.
 * @returns {(string|null)} Qué falta, o `null` si está completo.
 */
export function validarProgramacion(formulario) {
  if (!formulario?.destino) return "Por favor completa el destino."
  if (!formulario?.salida) return "Por favor completa la fecha de salida."
  return null
}

/**
 * Indica si una unidad está libre para programarse.
 *
 * El tablero marca como no disponibles las que ya están en un viaje.
 *
 * @param {object} unidad Un camión o un operador del tablero.
 * @returns {boolean} `true` si se puede asignar.
 */
export const estaDisponible = (unidad) => String(unidad?.disponible ?? "1") === "1"

/**
 * La posición de un camión, si el GPS la reportó.
 *
 * @param {object} camion El camión del tablero.
 * @returns {({lat: number, lon: number}|null)} La posición, o `null` si no hay.
 */
export function posicionDeCamion(camion) {
  const lat = Number.parseFloat(camion?.last_latitude)
  const lon = Number.parseFloat(camion?.last_longitude)
  return Number.isNaN(lat) || Number.isNaN(lon) ? null : { lat, lon }
}
