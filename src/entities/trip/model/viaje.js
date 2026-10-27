import { COLOR } from "../../../shared/ui/tokens"
/**
 * Estados por los que pasa un viaje, en el orden del ciclo.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_VIAJE = {
  EN_CAMINO: "In Coming",
  EN_TRANSITO: "In Transit",
  POR_TERMINAR: "Almost Over",
  COMPLETADO: "Completed",
  CANCELADO: "Cancelled",
}

/**
 * El estado que se asume cuando el viaje no trae ninguno.
 *
 * @type {string}
 */
export const ESTADO_POR_OMISION = ESTADO_VIAJE.EN_TRANSITO

/**
 * Color de cada estado de viaje.
 *
 * @readonly
 * @enum {string}
 */
export const COLOR_ESTADO_VIAJE = {
  [ESTADO_VIAJE.COMPLETADO]: COLOR.EXITO,
  [ESTADO_VIAJE.EN_TRANSITO]: COLOR.AVISO,
  [ESTADO_VIAJE.POR_TERMINAR]: COLOR.INFO,
  [ESTADO_VIAJE.CANCELADO]: COLOR.PELIGRO,
  [ESTADO_VIAJE.EN_CAMINO]: "#0891b2",
}

/**
 * El color con el que se marca el estado de un viaje.
 *
 * @param {string} [estado] El estado del viaje.
 * @returns {string} Su color, o un gris si el estado no se reconoce.
 */
export const colorEstadoViaje = (estado) =>
  COLOR_ESTADO_VIAJE[estado || ESTADO_POR_OMISION] ?? COLOR.APAGADO

/**
 * Tipos de etapa que puede tener un viaje.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_ETAPA = {
  CRUCE: "borderCrossing",
  VACIO: "emptyMileage",
  NORMAL: "normalTrip",
}

/**
 * Cómo se llama cada tipo de etapa en pantalla.
 *
 * La comparación va en minúsculas porque la base guarda el tipo con distinta
 * capitalización según por qué formulario se creó la etapa.
 *
 * @readonly
 * @enum {string}
 */
const NOMBRE_TIPO_ETAPA = {
  bordercrossing: "Cruce",
  emptymileage: "Etapa de Millaje Vacío",
  normaltrip: "Normal",
}

/**
 * El nombre de un tipo de etapa, tal como se lee en pantalla.
 *
 * @param {string} [tipo] El tipo tal como vino de la base.
 * @returns {string} El nombre, o el propio valor si no se reconoce.
 */
export const etiquetaTipoEtapa = (tipo) =>
  NOMBRE_TIPO_ETAPA[String(tipo ?? "").toLowerCase()] || tipo || "—"

/**
 * La nomenclatura con que la gente reconoce un viaje: `241-US-86T2-26`.
 *
 * Los viajes transnacionales llevan en medio su número de transnacional y de
 * movimiento; los demás quedan como `163-US-26`. Coincide con la que arma
 * `All_CL_Final` en el servidor en sus 261 viajes.
 *
 * @param {object} viaje El viaje como lo devuelve `getById`.
 * @returns {string} La nomenclatura, o vacío si el viaje no trae número.
 *
 * @example
 * nomenclaturaViaje({ trip_number: "241", country_code: "US", trip_year: "26",
 *   is_transnational: "1", transnational_number: "86", movement_number: "2" })
 */
export function nomenclaturaViaje(viaje) {
  if (!viaje?.trip_number) return ""
  const transnacional = String(viaje.is_transnational) === "1" && viaje.transnational_number
  const medio = transnacional ? `-${viaje.transnational_number}T${viaje.movement_number}` : ""
  return `${viaje.trip_number}-${viaje.country_code}${medio}-${viaje.trip_year}`
}
