import { describe, it, expect } from 'vitest';
import { recortarViaje, totalesDeVentas, finalizacionDeViaje, fechaCorta } from '../ventas';

const viaje = {
  trip_id: 612,
  trip_number: '267-US-26',
  stages_count: 3,
  total_tarifa: 6100,
  total_pagada: 1500,
  status_trip: 0,
  stages: [
    { trip_stage_id: 1, company_name: 'PALOS GARZA HUB', invoice_number: 'INV-10', rate_tarifa: 3600, paid_rate: '1500' },
    { trip_stage_id: 2, company_name: 'TRIANGLE EAST', invoice_number: 'INV-11', rate_tarifa: 2000, paid_rate: '' },
    { trip_stage_id: 3, company_name: 'Palos Garza Hub', invoice_number: '', rate_tarifa: 500, paid_rate: '0' },
  ],
};

describe('recortarViaje', () => {
  it('sin filtro de compañía ni invoice deja el viaje como está', () => {
    expect(recortarViaje(viaje, {})).toBe(viaje);
    expect(recortarViaje(viaje, { compania: '  ' })).toBe(viaje);
  });

  it('con compañía deja solo sus etapas y recalcula los totales', () => {
    const recortado = recortarViaje(viaje, { compania: 'palos garza' });
    expect(recortado.stages.map((e) => e.trip_stage_id)).toEqual([1, 3]);
    expect(recortado).toMatchObject({ stages_count: 2, etapas_totales: 3, total_tarifa: 4100, total_pagada: 1500 });
    expect(recortado.trip_number).toBe('267-US-26');
  });

  it('un viaje sin etapas de esa compañía no sale', () => {
    expect(recortarViaje(viaje, { compania: 'otra' })).toBeNull();
  });

  it('compañía e invoice juntos tienen que coincidir en la misma etapa', () => {
    expect(recortarViaje(viaje, { compania: 'palos', invoice: 'inv-10' }).stages).toHaveLength(1);
    expect(recortarViaje(viaje, { compania: 'triangle', invoice: 'inv-10' })).toBeNull();
  });

  it('no modifica el viaje original', () => {
    recortarViaje(viaje, { compania: 'triangle' });
    expect(viaje.stages).toHaveLength(3);
    expect(viaje.total_tarifa).toBe(6100);
  });
});

describe('totalesDeVentas', () => {
  it('suma lo que queda a la vista, no los viajes completos', () => {
    const otro = { ...viaje, trip_id: 613, stages: [viaje.stages[1]], total_tarifa: 2000, total_pagada: 0 };
    const visibles = [recortarViaje(viaje, { compania: 'palos' }), recortarViaje(otro, { compania: 'triangle' })].filter(Boolean);
    expect(totalesDeVentas([visibles[0]])).toEqual({ viajes: 1, etapas: 2, tarifa: 4100, pagada: 1500 });
    expect(totalesDeVentas([])).toEqual({ viajes: 0, etapas: 0, tarifa: 0, pagada: 0 });
  });
});

describe('fecha de finalización', () => {
  const conFechas = {
    ...viaje,
    stages: [
      { ...viaje.stages[0], fecha_inicio_cobro: '2026-10-30 09:35:29' },
      { ...viaje.stages[1], fecha_inicio_cobro: '2026-11-05 16:00:00' },
      { ...viaje.stages[2], fecha_inicio_cobro: null },
    ],
  };

  it('la del viaje es la más reciente de sus etapas', () => {
    expect(finalizacionDeViaje(conFechas)).toBe('2026-11-05');
    expect(finalizacionDeViaje(viaje)).toBe('');
    expect(fechaCorta('2026-11-05')).toBe('05/11/2026');
    expect(fechaCorta('')).toBe('');
  });

  it('el rango deja solo las etapas finalizadas entre esas fechas, con los dos extremos', () => {
    const recortado = recortarViaje(conFechas, { desde: '2026-10-30', hasta: '2026-10-31' });
    expect(recortado.stages.map((e) => e.trip_stage_id)).toEqual([1]);
    expect(recortado).toMatchObject({ stages_count: 1, etapas_totales: 3, total_tarifa: 3600 });
    expect(finalizacionDeViaje(recortado)).toBe('2026-10-30');
  });

  it('sirve con un solo extremo', () => {
    expect(recortarViaje(conFechas, { desde: '2026-11-01' }).stages.map((e) => e.trip_stage_id)).toEqual([2]);
    expect(recortarViaje(conFechas, { hasta: '2026-11-01' }).stages.map((e) => e.trip_stage_id)).toEqual([1]);
  });

  it('una etapa sin fecha no entra en ningún rango', () => {
    expect(recortarViaje(viaje, { desde: '2020-01-01' })).toBeNull();
  });

  it('se combina con la compañía', () => {
    expect(recortarViaje(conFechas, { compania: 'palos', desde: '2026-11-01' })).toBeNull();
    expect(recortarViaje(conFechas, { compania: 'triangle', desde: '2026-11-01' }).stages).toHaveLength(1);
  });
});
