import { describe, expect, it } from 'vitest';
import { ordenTieneReparacion, reparacionesDeOrdenes } from "../model/orden";

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
