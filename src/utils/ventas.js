const contiene = (valor, buscado) => String(valor || '').toLowerCase().includes(buscado);

const limpio = (texto) => String(texto || '').trim().toLowerCase();

const numero = (valor) => Number(String(valor ?? '').replace(',', '.')) || 0;

export const etapasQueCoinciden = (etapas, { compania, invoice } = {}) => {
  const porCompania = limpio(compania);
  const porInvoice = limpio(invoice);
  return (etapas || []).filter(
    (etapa) =>
      (!porCompania || contiene(etapa.company_name, porCompania)) &&
      (!porInvoice || contiene(etapa.invoice_number, porInvoice))
  );
};

export const recortarViaje = (viaje, filtros = {}) => {
  if (!limpio(filtros.compania) && !limpio(filtros.invoice)) return viaje;

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
