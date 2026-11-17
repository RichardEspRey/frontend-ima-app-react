import { describe, it, expect } from 'vitest';
import { periodosDe, textoDePeriodos, tienePeriodo } from '../periodos';

describe('periodos de diesel', () => {
  it('una carga sin periodo se lee como V', () => {
    expect(textoDePeriodos('')).toBe('V');
    expect(textoDePeriodos(null)).toBe('V');
    expect(textoDePeriodos('Q2,')).toBe('Q2, V');
    expect(textoDePeriodos(',Q4')).toBe('Q4, V');
  });

  it('ordena los trimestres y no repite', () => {
    expect(textoDePeriodos('Q3,Q2')).toBe('Q2, Q3');
    expect(periodosDe('Q4, Q3,Q4,,')).toEqual(['Q3', 'Q4', 'V']);
  });

  it('el filtro encuentra el viaje aunque tenga más de un periodo', () => {
    expect(tienePeriodo('Q3,Q4', 'Q4')).toBe(true);
    expect(tienePeriodo('Q3, Q4', 'Q3')).toBe(true);
    expect(tienePeriodo('Q3,Q4', 'Q2')).toBe(false);
  });

  it('V encuentra los vacíos, solos o mezclados', () => {
    expect(tienePeriodo('', 'V')).toBe(true);
    expect(tienePeriodo('Q2,', 'V')).toBe(true);
    expect(tienePeriodo('Q2', 'V')).toBe(false);
    expect(tienePeriodo('Q2,', 'EMPTY')).toBe(true);
  });
});
