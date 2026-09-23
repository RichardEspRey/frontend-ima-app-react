import { z } from "zod"
import { nullable } from "../../../shared/api/zodPhp"
import { estadoDocumento } from "../../unit"

/**
 * Los cuatro lugares donde puede estar una caja.
 *
 * Es una lista cerrada por decisión de operaciones: fuera de estos cuatro no
 * hay dónde poner una caja, y dejar el campo libre volvía la columna
 * incomparable entre sí misma.
 *
 * @readonly
 * @enum {string}
 */
export const UBICACION_CAJA = {
  PENSION: "PENSION NLD",
  TALLER: "TALLER",
  RUTA_SUBIENDO: "RUTA SUBIENDO",
  RUTA_BAJANDO: "RUTA BAJANDO",
}

/**
 * Las ubicaciones en el orden en que se ofrecen.
 *
 * @type {Array.<string>}
 */
export const UBICACIONES_CAJA = Object.values(UBICACION_CAJA)

/**
 * Si la caja lleva carga o va vacía.
 *
 * @readonly
 * @enum {string}
 */
export const OBSERVACION_CAJA = {
  VACIA: "VACIA",
  CARGADA: "CARGADA",
}

/**
 * Las observaciones en el orden en que se ofrecen.
 *
 * @type {Array.<string>}
 */
export const OBSERVACIONES_CAJA = Object.values(OBSERVACION_CAJA)

/**
 * El tipo de documento con el que la fianza vive en el expediente de la caja.
 *
 * En la base aparece escrito de las dos formas, `Fianza` y `FIANZA`; el
 * endpoint compara en mayúsculas y al subir una nueva se escribe así.
 *
 * @type {string}
 */
export const TIPO_DOCUMENTO_FIANZA = "Fianza"

const esquemaFianza = z.object({
  fecha_vencimiento: nullable(z.string()),
  url_pdf: nullable(z.string()),
})

/**
 * El renglón de una caja en el tablero de estatus.
 *
 * Trae junto lo automático —el viaje en turno, su operador, la dirección de la
 * etapa y el broker— y lo capturado a mano. `ubicacion` y `observacion` ya
 * vienen resueltos por el endpoint: son lo manual mientras siga vigente, y lo
 * automático en cuanto deja de estarlo.
 */
export const esquemaEstatusCaja = z.object({
  caja_id: z.coerce.number(),
  no_caja: z.coerce.string().catch(""),
  operador: nullable(z.string()),
  trip_id: nullable(z.coerce.number()),
  trip_number: nullable(z.coerce.string()),
  ubicacion: z.string().catch(UBICACION_CAJA.PENSION),
  observacion: z.string().catch(OBSERVACION_CAJA.VACIA),
  ubicacion_auto: z.string().catch(UBICACION_CAJA.PENSION),
  observacion_auto: z.string().catch(OBSERVACION_CAJA.VACIA),
  manual: z.coerce.boolean().catch(false),
  broker: nullable(z.string()),
  fianza: nullable(esquemaFianza),
})

/**
 * Una caja con su estatus resuelto.
 *
 * @typedef {object} EstatusCaja
 * @property {number} caja_id Identificador de la caja.
 * @property {string} no_caja Número con el que la conoce la operación.
 * @property {(string|null)} operador Conductor del viaje en turno.
 * @property {(number|null)} trip_id Viaje en turno, o `null` si no trae uno abierto.
 * @property {(string|null)} trip_number Número visible de ese viaje.
 * @property {string} ubicacion Dónde está, ya resuelto entre lo manual y lo automático.
 * @property {string} observacion Si va cargada o vacía, con la misma resolución.
 * @property {string} ubicacion_auto Lo que dirían los viajes si nadie capturara nada.
 * @property {string} observacion_auto Lo mismo para la observación.
 * @property {boolean} manual Si lo que se ve viene de una captura vigente.
 * @property {(string|null)} broker Compañía de la etapa en curso; solo si va cargada.
 * @property {({fecha_vencimiento: (string|null), url_pdf: (string|null)}|null)} fianza
 *   La fianza vigente de la caja, o `null` si no tiene ninguna.
 */

/**
 * Valida la lista que devuelve la API y descarta los renglones que no cumplen.
 *
 * Un renglón mal formado se omite en vez de tumbar la pantalla: el tablero
 * sirve igual con siete cajas que con ocho, y quien mira necesita ver las que
 * sí llegaron bien.
 *
 * @param {Array} lista Lo que vino en el campo `cajas` de la respuesta.
 * @returns {{cajas: Array.<EstatusCaja>, descartados: number}} Las válidas y cuántas se omitieron.
 */
export function normalizarEstatusCajas(lista) {
  const cajas = []
  let descartados = 0

  for (const fila of Array.isArray(lista) ? lista : []) {
    const resultado = esquemaEstatusCaja.safeParse(fila)
    if (resultado.success) cajas.push(resultado.data)
    else descartados += 1
  }

  return { cajas, descartados }
}

const REQUISITO_FIANZA = { tipo: "file", tiene_vencimiento: 1 }

/**
 * En qué estado está la fianza de una caja.
 *
 * Reutiliza la regla del expediente de unidades en lugar de tener la suya: una
 * fianza es un documento con vencimiento como cualquier otro, y que el tablero
 * la pintara vencida un día distinto que el Administrador de Cajas sería un
 * error que nadie sabría explicar.
 *
 * @param {object} [fianza] La fianza tal como viene del endpoint.
 * @param {Date} [hoy] Con qué día comparar; por omisión, hoy.
 * @returns {{estado: string, dias: (number|null), fecha: (string|null)}} El estado y su porqué.
 */
export function estadoFianza(fianza, hoy = new Date()) {
  return estadoDocumento(REQUISITO_FIANZA, fianza, hoy)
}

/**
 * Cuántas cajas van cargadas y cuántas vacías.
 *
 * @param {Array.<EstatusCaja>} cajas Las cajas del tablero.
 * @returns {{cargadas: number, vacias: number}} El conteo de cada una.
 */
export function contarPorObservacion(cajas) {
  const lista = Array.isArray(cajas) ? cajas : []
  const cargadas = lista.filter((caja) => caja.observacion === OBSERVACION_CAJA.CARGADA).length
  return { cargadas, vacias: lista.length - cargadas }
}
