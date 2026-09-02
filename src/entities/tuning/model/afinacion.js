import { z } from "zod"
import { idPhp, numeroPhp, nullable, fechaDia } from "../../../shared/api/zodPhp"

/**
 * Proporción del límite a partir de la cual una afinación se considera próxima.
 *
 * @type {number}
 */
export const UMBRAL_PROXIMA = 0.8

/**
 * Estado de un camión respecto a su próxima afinación.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_AFINACION = {
  AL_DIA: "al_dia",
  PROXIMA: "proxima",
  VENCIDA: "vencida",
}

/**
 * Una carga de diesel, que es de donde sale la lectura del odómetro.
 */
export const esquemaRegistroDiesel = z.object({
  id_diesel: idPhp(),
  odometro: numeroPhp(),
  fecha: z.string().catch(""),
  trip_number: nullable(idPhp()),
  ticket_url: nullable(z.string()),
})

/**
 * El estado de afinación de un camión.
 *
 * `millas_acumuladas` las calcula el backend restando el odómetro base al último
 * registrado, así que aquí se toma tal cual y no se recalcula: hacerlo daría dos
 * verdades que pueden discrepar.
 */
export const esquemaAfinacion = z.object({
  truck_id: idPhp(),
  unidad: z.string().catch(""),
  ultima_afinacion_fecha: fechaDia(),
  odometro_base: numeroPhp(),
  limite_afinacion: numeroPhp(),
  id_diesel: nullable(idPhp()),
  ultimo_odometro_registrado: numeroPhp(),
  millas_acumuladas: numeroPhp(),
  requiere_actualizacion: numeroPhp().transform((n) => n === 1),
  ticket_url: nullable(z.string()),
  ultimos_registros: z.array(esquemaRegistroDiesel).catch([]),
})

/**
 * El estado de afinación de un camión, ya validado.
 *
 * @typedef {object} Afinacion
 * @property {string} truck_id Identificador del camión.
 * @property {string} unidad Número de unidad.
 * @property {string} ultima_afinacion_fecha Fecha de la última afinación.
 * @property {number} odometro_base Odómetro cuando se afinó por última vez.
 * @property {number} limite_afinacion Millas entre afinaciones.
 * @property {number} millas_acumuladas Millas recorridas desde la última.
 * @property {boolean} requiere_actualizacion Si el backend pide revisar el dato.
 * @property {Array} ultimos_registros Últimas cargas de diesel del camión.
 */

/**
 * Un registro histórico de afinación.
 */
export const esquemaHistorial = z.object({
  id_afinacion: idPhp(),
  fecha_registro: fechaDia(),
  millas_acumuladas: numeroPhp(),
  porcentaje_aceite: numeroPhp(),
  unidad: z.string().catch(""),
})

/**
 * Qué proporción del límite lleva recorrida un camión.
 *
 * @param {Afinacion} afinacion El camión a evaluar.
 * @returns {number} Entre 0 y 1 normalmente; pasa de 1 si ya se venció.
 */
export function progresoAfinacion(afinacion) {
  const limite = Number(afinacion?.limite_afinacion ?? 0)
  if (limite <= 0) return 0
  return Number(afinacion?.millas_acumuladas ?? 0) / limite
}

/**
 * Clasifica a un camión según lo cerca que esté de su afinación.
 *
 * @param {Afinacion} afinacion El camión a evaluar.
 * @returns {string} Un valor de `ESTADO_AFINACION`.
 */
export function estadoAfinacion(afinacion) {
  const progreso = progresoAfinacion(afinacion)
  if (progreso >= 1) return ESTADO_AFINACION.VENCIDA
  if (progreso >= UMBRAL_PROXIMA) return ESTADO_AFINACION.PROXIMA
  return ESTADO_AFINACION.AL_DIA
}

/**
 * Millas que faltan para la próxima afinación.
 *
 * @param {Afinacion} afinacion El camión a evaluar.
 * @returns {number} Las millas restantes; 0 si ya se pasó.
 */
export const millasRestantes = (afinacion) =>
  Math.max(0, Number(afinacion?.limite_afinacion ?? 0) - Number(afinacion?.millas_acumuladas ?? 0))

/**
 * Detecta una lectura de odómetro que se salga del orden esperado.
 *
 * El odómetro solo puede subir, así que una lectura menor que la anterior es un
 * error de captura. Pasa: en los datos reales hay un registro con 149 946 entre
 * lecturas de 1,5 millones — un dígito perdido al teclear. Por eso el backend
 * tiene la operación `correct_odometer`.
 *
 * Los registros vienen del más reciente al más antiguo.
 *
 * @param {Array} registros Las cargas de diesel del camión.
 * @returns {Array} Los registros cuya lectura rompe el orden.
 */
export function lecturasSospechosas(registros = []) {
  const sospechosas = []

  for (let i = 1; i < registros.length - 1; i += 1) {
    const anterior = Number(registros[i - 1]?.odometro ?? 0)
    const actual = Number(registros[i]?.odometro ?? 0)
    const siguiente = Number(registros[i + 1]?.odometro ?? 0)
    if (actual < siguiente && actual < anterior) sospechosas.push(registros[i])
  }

  return sospechosas
}

/**
 * Valida una lista con el esquema dado, descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @param {object} esquema Esquema zod con el que validar cada fila.
 * @returns {{validos: Array, descartados: number}} Los que pasaron y cuántos no.
 */
export function normalizarLista(filas = [], esquema) {
  const validos = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquema.safeParse(fila)
    if (resultado.success) validos.push(resultado.data)
    else descartados += 1
  }

  return { validos, descartados }
}
