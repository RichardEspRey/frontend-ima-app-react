import { z } from "zod"
import { idPhp, numeroPhp, nullable } from "../../../shared/api/zodPhp"
import { COLOR } from "../../../shared/ui/tokens"

/**
 * Formas de pago que acepta una etapa de viaje.
 *
 * @type {Array.<string>}
 */
export const METODOS_PAGO = ["RTS", "CHEQUE", "TRIUM PAY", "DEPOSITO"]

/**
 * Estados de cobro de un viaje, en el orden del ciclo.
 *
 * Los valores son los que guarda la base. `null` significa lo mismo que 0: hay
 * 9 viajes reales sin estado y son pendientes de cobrar, no un caso aparte.
 *
 * @readonly
 * @enum {number}
 */
export const ESTADO_COBRO = {
  PENDIENTE_COBRAR: 0,
  COBRADA_PENDIENTE_PAGO: 1,
  COBRADA_PENDIENTE_RTS: 2,
  PAGADA: 3,
}

/**
 * Cómo se muestra cada estado de cobro.
 *
 * Sale de `constants/finances.js`, que ya lo tenía. Se mantiene el mismo texto y
 * el mismo color para no cambiar lo que la gente ya reconoce.
 *
 * @readonly
 * @enum {object}
 */
export const ETIQUETA_COBRO = {
  [ESTADO_COBRO.PAGADA]: { label: "Pagada", color: COLOR.EXITO },
  [ESTADO_COBRO.COBRADA_PENDIENTE_RTS]: { label: "Cobrada, pendiente RTS", color: "#fdd835" },
  [ESTADO_COBRO.COBRADA_PENDIENTE_PAGO]: { label: "Cobrada, pendiente de pago", color: COLOR.AVISO },
  [ESTADO_COBRO.PENDIENTE_COBRAR]: { label: "Pendiente de cobrar", color: COLOR.PELIGRO },
}

/**
 * Estados del pago a un conductor.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_PAGO_CONDUCTOR = {
  PENDIENTE: "0",
  PAGADO: "1",
  AUTORIZADO: "2",
}

/**
 * Una etapa de viaje con su cobro.
 */
export const esquemaEtapa = z.object({
  trip_stage_id: idPhp(),
  trip_id: idPhp(),
  stage_number: numeroPhp(),
  origin: z.string().catch(""),
  destination: z.string().catch(""),
  rate_tarifa: numeroPhp(),
  tarifa_pagada: numeroPhp(),
  metodo_pago: nullable(z.string()),
  stageType: z.string().catch(""),
  status: nullable(numeroPhp()),
  invoice_number: nullable(z.string()),
  company_name: z.string().catch(""),
  fecha_inicio_cobro: nullable(z.string()),
  fecha_pago_final: nullable(z.string()),
})

/**
 * Un viaje visto desde finanzas: lo que se cobra y lo que ya se pagó.
 */
export const esquemaViajeFinanzas = z.object({
  trip_id: idPhp(),
  trip_number: z.string().catch(""),
  stages_count: numeroPhp(),
  total_tarifa: numeroPhp(),
  total_pagada: numeroPhp(),
  status_trip: nullable(numeroPhp()),
  stages: z.array(esquemaEtapa).catch([]),
})

/**
 * El pago pendiente a un conductor por un viaje.
 */
export const esquemaPagoConductor = z.object({
  trip_id: idPhp(),
  trip_number: z.string().catch(""),
  driver_id: nullable(idPhp()),
  nombre: z.string().catch(""),
  status_txt: z.string().catch(""),
  stages_count: numeroPhp(),
  total_tarifa: numeroPhp(),
  total_millas_cortas: numeroPhp(),
  status_trip: nullable(numeroPhp()),
  Pago_driver: numeroPhp(),
  status_payment: z.coerce.string().catch(ESTADO_PAGO_CONDUCTOR.PENDIENTE),
})

/**
 * La tarifa por milla de un conductor.
 */
export const esquemaTarifaConductor = z.object({
  driver_id: idPhp(),
  nombre: z.string().catch(""),
  activo: numeroPhp().transform((n) => n === 1),
  valor_milla: numeroPhp(),
})

/**
 * Normaliza un estado de cobro, tratando el nulo como pendiente.
 *
 * @param {*} estado El valor crudo de `status_trip`.
 * @returns {number} Un valor de `ESTADO_COBRO`.
 */
export const normalizarEstadoCobro = (estado) =>
  estado === null || estado === undefined ? ESTADO_COBRO.PENDIENTE_COBRAR : Number(estado)

/**
 * Cómo mostrar el estado de cobro de un viaje.
 *
 * @param {object} viaje El viaje a evaluar.
 * @returns {{label: string, color: string}} Texto y color.
 */
export const etiquetaCobro = (viaje) =>
  ETIQUETA_COBRO[normalizarEstadoCobro(viaje?.status_trip)] ??
  ETIQUETA_COBRO[ESTADO_COBRO.PENDIENTE_COBRAR]

/**
 * Indica si un viaje ya está cobrado por completo.
 *
 * @param {object} viaje El viaje a evaluar.
 * @returns {boolean} `true` si está pagado.
 */
export const estaPagado = (viaje) =>
  normalizarEstadoCobro(viaje?.status_trip) === ESTADO_COBRO.PAGADA

/**
 * Lo que falta por cobrar de un viaje.
 *
 * @param {object} viaje El viaje a evaluar.
 * @returns {number} La diferencia; 0 si ya se cobró de más o completo.
 */
export const saldoPendiente = (viaje) =>
  Math.max(0, Number(viaje?.total_tarifa ?? 0) - Number(viaje?.total_pagada ?? 0))

/**
 * Suma tarifa y cobrado de una lista de viajes.
 *
 * @param {Array} viajes Los viajes a sumar.
 * @returns {{tarifa: number, pagada: number, pendiente: number}} Los totales.
 */
export function totalesFinanzas(viajes = []) {
  const tarifa = viajes.reduce((suma, v) => suma + Number(v.total_tarifa ?? 0), 0)
  const pagada = viajes.reduce((suma, v) => suma + Number(v.total_pagada ?? 0), 0)
  return { tarifa, pagada, pendiente: Math.max(0, tarifa - pagada) }
}

/**
 * Indica si el pago a un conductor está autorizado pero sin pagar.
 *
 * @param {object} pago El pago a evaluar.
 * @returns {boolean} `true` si está autorizado.
 */
export const estaAutorizado = (pago) =>
  String(pago?.status_payment) === ESTADO_PAGO_CONDUCTOR.AUTORIZADO

/**
 * Indica si al conductor ya se le pagó.
 *
 * @param {object} pago El pago a evaluar.
 * @returns {boolean} `true` si está pagado.
 */
export const estaPagadoConductor = (pago) =>
  String(pago?.status_payment) === ESTADO_PAGO_CONDUCTOR.PAGADO

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
