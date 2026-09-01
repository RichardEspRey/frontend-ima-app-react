import { OP_GUARDADO } from "../../../entities/trip"

/**
 * Desde qué pantalla se está editando un viaje.
 *
 * Son la misma pantalla con dos permisos distintos: la normal edita lo que se
 * puede cambiar sobre la marcha, y la completa no tiene restricciones —también
 * el enlace transnacional— y trabaja sobre los catálogos completos, porque un
 * viaje viejo puede tener un conductor o una unidad que ya no está activa.
 *
 * @readonly
 * @enum {string}
 */
export const MODO_EDICION = {
  NORMAL: "normal",
  COMPLETO: "completo",
}

/**
 * Lo que cambia entre los dos modos de edición.
 *
 * @type {Object.<string, object>}
 */
export const AJUSTES_MODO = {
  [MODO_EDICION.NORMAL]: {
    op: OP_GUARDADO.NORMAL,
    catalogosCompletos: false,
    editaTransnacional: false,
  },
  [MODO_EDICION.COMPLETO]: {
    op: OP_GUARDADO.COMPLETO,
    catalogosCompletos: true,
    editaTransnacional: true,
  },
}

/**
 * Los ajustes de un modo de edición.
 *
 * @param {string} modo Un valor de `MODO_EDICION`.
 * @returns {object} Los ajustes.
 * @throws {Error} Si el modo no existe.
 */
export function ajustesDe(modo) {
  const ajustes = AJUSTES_MODO[modo]
  if (!ajustes) throw new Error(`Modo de edición desconocido: ${modo}`)
  return ajustes
}

/**
 * Documentos que no vencen, así que su modal no pide fecha.
 *
 * @type {Array.<string>}
 */
export const DOCUMENTOS_SIN_VENCIMIENTO = [
  "ima_invoice",
  "doda",
  "ci",
  "entry",
  "manifiesto",
  "bl",
  "orden_retiro",
  "bl_firmado",
  "bl_firmado_doc",
]

/**
 * Indica si un tipo de documento tiene fecha de vencimiento.
 *
 * @param {string} tipo El tipo de documento.
 * @returns {boolean} `true` si hay que pedir la fecha.
 */
export const pideVencimiento = (tipo) => !DOCUMENTOS_SIN_VENCIMIENTO.includes(tipo)

/**
 * Estados de viaje en los que se puede generar una factura.
 *
 * @type {Array.<string>}
 */
export const ESTADOS_FACTURABLES = ["In Transit", "Almost Over", "Completed"]

/**
 * Indica si un viaje admite que se le generen facturas.
 *
 * @param {string} estado El estado del viaje.
 * @returns {boolean} `true` si se puede facturar.
 */
export const admiteFacturas = (estado) => ESTADOS_FACTURABLES.includes(estado)

/**
 * El estado que le toca a una etapa de cruce según tenga número de CI.
 *
 * Una etapa de cruce arranca "In Coming" y pasa a "In Transit" en cuanto se le
 * captura el CI: es lo que marca que el cruce ya se hizo.
 *
 * @param {string} numeroCi El número de CI capturado.
 * @returns {string} El estado que corresponde.
 */
export const estadoPorCi = (numeroCi) =>
  numeroCi && String(numeroCi).trim() !== "" ? "In Transit" : "In Coming"
