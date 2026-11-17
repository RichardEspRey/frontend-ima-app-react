const limpio = (texto) => String(texto ?? "").trim().toLowerCase()
const contiene = (valor, buscado) => String(valor ?? "").toLowerCase().includes(buscado)
const numero = (valor) => Number(String(valor ?? "").replace(",", ".")) || 0

/**
 * El día en que una etapa se dio por finalizada para Ventas.
 *
 * Es cuando dejó de estar en rojo —pasó a naranja, amarillo o verde—, que el
 * servidor guarda en `fecha_inicio_cobro`. Las etapas pagadas antes de que
 * existiera ese campo no la tienen.
 *
 * @param {object} [etapa] La etapa.
 * @returns {string} `AAAA-MM-DD`, o vacío si no tiene.
 */
export const fechaDeFinalizacion = (etapa) => String(etapa?.fecha_inicio_cobro ?? "").slice(0, 10)

/**
 * La fecha de finalización de un viaje: la más reciente de sus etapas.
 *
 * @param {object} [viaje] El viaje con sus `stages`.
 * @returns {string} `AAAA-MM-DD`, o vacío si ninguna etapa tiene fecha.
 */
export const finalizacionDeViaje = (viaje) =>
  (viaje?.stages ?? []).map(fechaDeFinalizacion).filter(Boolean).sort().pop() ?? ""

/**
 * Una fecha `AAAA-MM-DD` como se lee en la tabla.
 *
 * @param {string} [fecha] La fecha.
 * @returns {string} `DD/MM/AAAA`, o vacío.
 */
export function fechaCorta(fecha) {
  const [anio, mes, dia] = String(fecha ?? "").split("-")
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : ""
}

const enRango = (fecha, desde, hasta) =>
  Boolean(fecha) && (!desde || fecha >= desde) && (!hasta || fecha <= hasta)

/**
 * Las etapas de un viaje que coinciden con los filtros de compañía, invoice y fechas.
 *
 * Todos los filtros puestos tienen que cumplirse en la misma etapa. Con rango de
 * fechas, una etapa sin fecha de finalización no entra.
 *
 * @param {Array.<object>} [etapas] Las etapas del viaje.
 * @param {object} [filtros] Lo que hay puesto en los filtros.
 * @param {string} [filtros.compania] Texto a buscar en `company_name`.
 * @param {string} [filtros.invoice] Texto a buscar en `invoice_number`.
 * @param {string} [filtros.desde] Primer día del rango de finalización, `AAAA-MM-DD`.
 * @param {string} [filtros.hasta] Último día del rango, inclusive.
 * @returns {Array.<object>} Las etapas que coinciden; todas si no hay filtros.
 */
export function etapasQueCoinciden(etapas, { compania, invoice, desde, hasta } = {}) {
  const porCompania = limpio(compania)
  const porInvoice = limpio(invoice)
  const porFecha = Boolean(desde || hasta)

  return (etapas ?? []).filter(
    (etapa) =>
      (!porCompania || contiene(etapa.company_name, porCompania)) &&
      (!porInvoice || contiene(etapa.invoice_number, porInvoice)) &&
      (!porFecha || enRango(fechaDeFinalizacion(etapa), desde, hasta)),
  )
}

/**
 * Deja un viaje solo con las etapas que coinciden con el filtro.
 *
 * Dos de cada tres viajes llevan etapas de compañías distintas. Al buscar una
 * compañía, enseñar el viaje entero mezclaba sus etapas con las de otras y daba
 * un total que no era el de esa compañía. Aquí el viaje se queda con las suyas
 * y sus totales se recalculan sobre ellas. `etapas_totales` guarda cuántas tenía,
 * para poder decir «1 de 3». No toca el viaje original.
 *
 * @param {object} viaje El viaje con sus `stages`.
 * @param {object} [filtros] Los de {@link etapasQueCoinciden}.
 * @returns {(object|null)} El mismo viaje si no hay filtros, uno recortado, o `null` si ninguna etapa coincide.
 *
 * @example
 * recortarViaje(viaje, { compania: "palos garza" })?.stages_count // solo las de esa compañía
 */
export function recortarViaje(viaje, filtros = {}) {
  if (!limpio(filtros.compania) && !limpio(filtros.invoice) && !filtros.desde && !filtros.hasta) return viaje

  const etapas = etapasQueCoinciden(viaje.stages, filtros)
  if (etapas.length === 0) return null

  return {
    ...viaje,
    stages: etapas,
    stages_count: etapas.length,
    etapas_totales: (viaje.stages ?? []).length,
    total_tarifa: etapas.reduce((suma, etapa) => suma + numero(etapa.rate_tarifa), 0),
    total_pagada: etapas.reduce((suma, etapa) => suma + numero(etapa.paid_rate), 0),
  }
}

/**
 * Lo que suman los viajes que quedaron a la vista tras filtrar.
 *
 * Es el renglón «Total filtrado» de Ventas. Se calcula en pantalla y no se guarda.
 *
 * @param {Array.<object>} [viajes] Los viajes filtrados, ya recortados.
 * @returns {{viajes: number, etapas: number, tarifa: number, pagada: number}} Cuántos son y cuánto suman.
 */
export function totalesDeVentas(viajes = []) {
  return {
    viajes: viajes.length,
    etapas: viajes.reduce((suma, viaje) => suma + (viaje.stages ?? []).length, 0),
    tarifa: viajes.reduce((suma, viaje) => suma + numero(viaje.total_tarifa), 0),
    pagada: viajes.reduce((suma, viaje) => suma + numero(viaje.total_pagada), 0),
  }
}
