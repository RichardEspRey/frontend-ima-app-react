import { describe, expect, it } from 'vitest';
import { conOrigenes, ordenTieneOrigen, ordenTieneReparacion, reparacionesDeOrdenes } from "../model/orden";

const ordenes = [
  { servicios: [{ tipo_reparacion: 'Ajuste de frenos generales' }, { tipo_reparacion: 'Lavado de unidad' }] },
  { servicios: [{ tipo_reparacion: ' lavado de unidad ' }, { tipo_reparacion: 'Cambio de balatas y frenos' }, { tipo_reparacion: null }] },
  { servicios: [] },
  {},
];

describe('reparacionesDeOrdenes', () => {
  it('junta las reparaciones de todas las órdenes sin repetir ni vacías, en orden alfabético', () => {
    expect(reparacionesDeOrdenes(ordenes)).toEqual([
      'Ajuste de frenos generales',
      'Cambio de balatas y frenos',
      'Lavado de unidad',
    ]);
  });

  it('aguanta una lista vacía o ausente', () => {
    expect(reparacionesDeOrdenes(undefined)).toEqual([]);
  });
});

describe('ordenTieneReparacion', () => {
  it('encuentra la palabra en cualquier parte, sin importar mayúsculas ni acentos', () => {
    expect(ordenTieneReparacion(ordenes[0], 'FRENOS')).toBe(true);
    expect(ordenTieneReparacion(ordenes[1], 'balatas')).toBe(true);
    expect(ordenTieneReparacion({ servicios: [{ tipo_reparacion: 'Reparación de suspensión' }] }, 'reparacion de suspension')).toBe(true);
  });

  it('deja fuera las órdenes que no la tienen', () => {
    expect(ordenTieneReparacion(ordenes[0], 'balatas')).toBe(false);
    expect(ordenTieneReparacion(ordenes[3], 'frenos')).toBe(false);
  });

  it('sin texto deja pasar todas', () => {
    expect(ordenTieneReparacion(ordenes[3], '  ')).toBe(true);
  });
});

describe('conOrigenes', () => {
  it('le pone a cada servicio su origen por id y deja vacío el que no tiene', () => {
    const origenes = new Map([['10', 'Externo']]);
    const [orden] = conOrigenes([{ id_orden: '1', servicios: [{ id_servicio: '10' }, { id_servicio: '11' }] }], origenes);
    expect(orden.servicios.map((s) => s.origen_servicio)).toEqual(['Externo', null]);
  });

  it('respeta el origen si la orden ya lo trae', () => {
    const [orden] = conOrigenes([{ servicios: [{ id_servicio: '10', origen_servicio: 'Interno' }] }], new Map([['10', 'Externo']]));
    expect(orden.servicios[0].origen_servicio).toBe('Interno');
  });
});

describe('ordenTieneOrigen', () => {
  const orden = { servicios: [{ origen_servicio: 'Interno' }, { origen_servicio: 'externo' }] };

  it('encuentra la orden si alguno de sus servicios tiene ese origen', () => {
    expect(ordenTieneOrigen(orden, 'Externo')).toBe(true);
    expect(ordenTieneOrigen({ servicios: [{ origen_servicio: null }] }, 'Interno')).toBe(false);
  });

  it('sin origen elegido deja pasar todas', () => {
    expect(ordenTieneOrigen({}, '')).toBe(true);
  });
});
