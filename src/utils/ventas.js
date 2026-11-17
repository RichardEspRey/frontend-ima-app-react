const contiene = (valor, buscado) => String(valor || '').toLowerCase().includes(buscado);

const limpio = (texto) => String(texto || '').trim().toLowerCase();

const numero = (valor) => Number(String(valor ?? '').replace(',', '.')) || 0;

export const fechaDeFinalizacion = (etapa) => String(etapa?.fecha_inicio_cobro || '').slice(0, 10);

export const finalizacionDeViaje = (viaje) =>
  (viaje?.stages || []).map(fechaDeFinalizacion).filter(Boolean).sort().pop() || '';

export const fechaCorta = (fecha) => {
  const [anio, mes, dia] = String(fecha || '').split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : '';
};

const enRango = (fecha, desde, hasta) => Boolean(fecha) && (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

export const etapasQueCoinciden = (etapas, { compania, invoice, desde, hasta } = {}) => {
  const porCompania = limpio(compania);
  const porInvoice = limpio(invoice);
  const porFecha = Boolean(desde || hasta);
  return (etapas || []).filter(
    (etapa) =>
      (!porCompania || contiene(etapa.company_name, porCompania)) &&
      (!porInvoice || contiene(etapa.invoice_number, porInvoice)) &&
      (!porFecha || enRango(fechaDeFinalizacion(etapa), desde, hasta))
  );
};

export const recortarViaje = (viaje, filtros = {}) => {
  if (!limpio(filtros.compania) && !limpio(filtros.invoice) && !filtros.desde && !filtros.hasta) return viaje;

  const etapas = etapasQueCoinciden(viaje.stages, filtros);
  if (etapas.length === 0) return null;

  return {
    ...viaje,
    stages: etapas,
    stages_count: etapas.length,
    etapas_totales: (viaje.stages || []).length,
    total_tarifa: etapas.reduce((suma, etapa) => suma + numero(etapa.rate_tarifa), 0),
    total_pagada: etapas.reduce((suma, etapa) => suma + numero(etapa.paid_rate), 0),
  };
};

export const totalesDeVentas = (viajes) => ({
  viajes: viajes.length,
  etapas: viajes.reduce((suma, viaje) => suma + (viaje.stages || []).length, 0),
  tarifa: viajes.reduce((suma, viaje) => suma + numero(viaje.total_tarifa), 0),
  pagada: viajes.reduce((suma, viaje) => suma + numero(viaje.total_pagada), 0),
});
