import { UNIDAD } from "../../../entities/maintenance-point"

/**
 * Los filtros vacíos de la lista de inspecciones.
 *
 * @readonly
 * @type {object}
 */
export const SIN_FILTROS_INSPECCION = { viaje: "", operador: "", unidad: "", desde: "", hasta: "" }

/**
 * Los filtros vacíos de la lista de reparaciones pendientes.
 *
 * @readonly
 * @type {object}
 */
export const SIN_FILTROS_PENDIENTE = { unidad: "", texto: "", origen: "" }

/**
 * De dónde salió una reparación pendiente.
 *
 * Separar las dos cosas importa: lo que reportó el operador en un viaje y lo que
 * el taller levantó con la unidad enfrente son dos conversaciones distintas.
 *
 * @readonly
 * @type {Array.<{id: string, etiqueta: string}>}
 */
export const ORIGENES = [
  { id: "", etiqueta: "Todos" },
  { id: "inspeccion", etiqueta: "Del operador" },
  { id: "manual", etiqueta: "Levantados a mano" },
]

/**
 * Indica si algún filtro tiene algo escrito.
 *
 * @param {object} filtros Los filtros puestos.
 * @returns {boolean} `true` si hay al menos uno con valor.
 */
export const hayFiltros = (filtros) => Object.values(filtros).some((valor) => valor !== "")

const contiene = (texto, buscado) =>
  String(texto ?? "").toLowerCase().includes(buscado.trim().toLowerCase())

/**
 * Deja las inspecciones de la pestaña que se está viendo.
 *
 * @param {Array.<object>} inspecciones Las inspecciones del lado.
 * @param {boolean} completadas `true` para las cerradas.
 * @returns {Array.<object>} Las de esa pestaña.
 */
export const deLaPestana = (inspecciones = [], completadas) =>
  inspecciones.filter((fila) => (fila.estatus_lado === "completada") === completadas)

/**
 * Aplica los filtros a la lista de inspecciones.
 *
 * El viaje se busca sobre la nomenclatura completa y sobre el número, porque la
 * gente escribe cualquiera de los dos.
 *
 * @param {Array.<object>} inspecciones Las inspecciones de la pestaña.
 * @param {object} filtros Lo que hay puesto.
 * @param {string} lado `camion` o `caja`.
 * @returns {Array.<object>} Las que pasan.
 */
export function filtrarInspecciones(inspecciones = [], filtros, lado) {
  return inspecciones.filter((fila) => {
    if (filtros.viaje.trim() && !contiene(`${fila.nomenclatura ?? ""} ${fila.trip_number}`, filtros.viaje)) {
      return false
    }

    if (filtros.operador.trim() && !contiene(fila.operador, filtros.operador)) return false

    const unidad = String((lado === UNIDAD.CAJA ? fila.no_caja : fila.no_camion) || "")
    if (filtros.unidad.trim() && unidad !== filtros.unidad.trim()) return false

    const fecha = String(fila.fecha_creacion ?? "").slice(0, 10)
    if (filtros.desde && fecha < filtros.desde) return false
    if (filtros.hasta && fecha > filtros.hasta) return false

    return true
  })
}

/**
 * Aplica los filtros a las reparaciones pendientes.
 *
 * @param {Array.<object>} pendientes Las reparaciones del lado.
 * @param {object} filtros Lo que hay puesto.
 * @param {string} lado `camion` o `caja`.
 * @returns {Array.<object>} Las que pasan.
 */
export function filtrarPendientes(pendientes = [], filtros, lado) {
  return pendientes.filter((pendiente) => {
    const unidad = String((lado === UNIDAD.CAJA ? pendiente.no_caja : pendiente.no_camion) || "")
    if (filtros.unidad.trim() && unidad !== filtros.unidad.trim()) return false

    if (filtros.origen && pendiente.origen !== filtros.origen) return false

    if (
      filtros.texto.trim() &&
      !contiene(`${pendiente.descripcion} ${pendiente.categoria}`, filtros.texto)
    ) {
      return false
    }

    return true
  })
}
