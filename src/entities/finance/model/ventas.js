const limpio = (texto) => String(texto ?? "").trim().toLowerCase()
const contiene = (valor, buscado) => String(valor ?? "").toLowerCase().includes(buscado)
const numero = (valor) => Number(String(valor ?? "").replace(",", ".")) || 0

/**
 * Las etapas de un viaje que coinciden con los filtros de compañía e invoice.
 *
 * Si vienen los dos filtros, tienen que cumplirse en la misma etapa.
 *
 * @param {Array.<object>} [etapas] Las etapas del viaje.
 * @param {object} [filtros] Lo que hay escrito en los buscadores.
 * @param {string} [filtros.compania] Texto a buscar en `company_name`.
 * @param {string} [filtros.invoice] Texto a buscar en `invoice_number`.
 * @returns {Array.<object>} Las etapas que coinciden; todas si no hay filtros.
 */
export function etapasQueCoinciden(etapas, { compania, invoice } = {}) {
  const porCompania = limpio(compania)
  const porInvoice = limpio(invoice)

  return (etapas ?? []).filter(
    (etapa) =>
      (!porCompania || contiene(etapa.company_name, porCompania)) &&
      (!porInvoice || contiene(etapa.invoice_number, porInvoice)),
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
  if (!limpio(filtros.compania) && !limpio(filtros.invoice)) return viaje

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
