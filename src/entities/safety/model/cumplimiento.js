import { z } from "zod"
import { idPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Los tres documentos que un viaje debe tener al cerrarse.
 *
 * El orden es el de las columnas en pantalla.
 *
 * @readonly
 * @enum {string}
 */
export const DOCUMENTOS_REQUERIDOS = {
  LIBRO: "libro_electronico",
  DIESEL: "reporte_diesel",
  PCMILLER: "reporte_pcmiller",
}

/**
 * Cómo se llama cada documento en pantalla.
 *
 * @readonly
 * @enum {string}
 */
export const NOMBRE_DOCUMENTO = {
  [DOCUMENTOS_REQUERIDOS.LIBRO]: "Libro electrónico",
  [DOCUMENTOS_REQUERIDOS.DIESEL]: "Reporte diesel",
  [DOCUMENTOS_REQUERIDOS.PCMILLER]: "Reporte PC Miller",
}

/**
 * Un viaje visto desde cumplimiento: qué documentos tiene y cuáles le faltan.
 *
 * Los tres documentos llegan como una URL o como `null`. Un `null` significa que
 * falta, no que haya un error.
 */
export const esquemaViajeSafety = z.object({
  trip_id: idPhp(),
  trip_number: z.string().catch(""),
  driver_nombre: z.string().catch(""),
  truck_unidad: z.string().catch(""),
  libro_electronico: nullable(z.string()),
  reporte_diesel: nullable(z.string()),
  reporte_pcmiller: nullable(z.string()),
})

/**
 * Un viaje con su estado de documentación.
 *
 * @typedef {object} ViajeSafety
 * @property {string} trip_id Identificador.
 * @property {string} trip_number Número visible del viaje.
 * @property {string} driver_nombre Conductor.
 * @property {string} truck_unidad Unidad.
 * @property {(string|null)} libro_electronico URL del documento, o `null` si falta.
 * @property {(string|null)} reporte_diesel URL del documento, o `null` si falta.
 * @property {(string|null)} reporte_pcmiller URL del documento, o `null` si falta.
 */

/**
 * Indica si un viaje tiene subido un documento concreto.
 *
 * @param {ViajeSafety} viaje El viaje a evaluar.
 * @param {string} documento Una clave de `DOCUMENTOS_REQUERIDOS`.
 * @returns {boolean} `true` si el documento está.
 */
export const tieneDocumento = (viaje, documento) => Boolean(viaje?.[documento])

/**
 * Los documentos que le faltan a un viaje.
 *
 * @param {ViajeSafety} viaje El viaje a evaluar.
 * @returns {Array.<string>} Las claves de los documentos faltantes.
 */
export const documentosFaltantes = (viaje) =>
  Object.values(DOCUMENTOS_REQUERIDOS).filter((doc) => !tieneDocumento(viaje, doc))

/**
 * Indica si un viaje tiene toda su documentación.
 *
 * @param {ViajeSafety} viaje El viaje a evaluar.
 * @returns {boolean} `true` si no le falta ninguno.
 */
export const cumplimientoCompleto = (viaje) => documentosFaltantes(viaje).length === 0

/**
 * Separa los viajes entre los que cumplen y los que no.
 *
 * Es lo que alimenta las dos primeras pestañas de la pantalla.
 *
 * @param {Array.<ViajeSafety>} viajes Los viajes a separar.
 * @returns {{pendientes: Array, completos: Array}} Los dos grupos.
 */
export function separarPorCumplimiento(viajes = []) {
  return {
    pendientes: viajes.filter((v) => !cumplimientoCompleto(v)),
    completos: viajes.filter(cumplimientoCompleto),
  }
}

/**
 * Cuenta cuántos viajes carecen de cada documento.
 *
 * Alimenta los contadores rojos junto a cada columna.
 *
 * @param {Array.<ViajeSafety>} viajes Los viajes a contar.
 * @returns {object} Un conteo por cada clave de `DOCUMENTOS_REQUERIDOS`.
 */
export function contarFaltantes(viajes = []) {
  const conteo = {}
  for (const doc of Object.values(DOCUMENTOS_REQUERIDOS)) {
    conteo[doc] = viajes.filter((v) => !tieneDocumento(v, doc)).length
  }
  return conteo
}

/**
 * Valida la lista de viajes descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{viajes: Array.<ViajeSafety>, descartados: number}} Los válidos y cuántos se cayeron.
 */
export function normalizarViajesSafety(filas = []) {
  const viajes = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaViajeSafety.safeParse(fila)
    if (resultado.success) viajes.push(resultado.data)
    else descartados += 1
  }

  return { viajes, descartados }
}
