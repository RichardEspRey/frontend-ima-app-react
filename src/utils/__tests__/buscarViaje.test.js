import { describe, it, expect } from 'vitest';
import { coincideViaje, numeroDeViaje } from '../buscarViaje';

const VIAJES = ['1-US-26', '1-MX-1T1-26', '10-US-26', '100-US-26', '21-US-1T2-26', '267-US-26', '109-MX-99T1-26'];
const buscar = (texto) => VIAJES.filter((viaje) => coincideViaje(viaje, texto));

describe('buscar viaje por número', () => {
  it('rellena con ceros: 1 es el viaje 001, no el 10 ni el 100', () => {
    expect(buscar('1')).toEqual(['1-US-26', '1-MX-1T1-26']);
    expect(buscar('001')).toEqual(['1-US-26', '1-MX-1T1-26']);
    expect(buscar('10')).toEqual(['10-US-26']);
  });

  it('solo mira los primeros números, no el resto de la nomenclatura', () => {
    expect(buscar('26')).toEqual([]);
    expect(buscar('99')).toEqual([]);
    expect(buscar('267')).toEqual(['267-US-26']);
  });

  it('con letras o guiones busca en toda la nomenclatura', () => {
    expect(buscar('mx')).toEqual(['1-MX-1T1-26', '109-MX-99T1-26']);
    expect(buscar('267-US')).toEqual(['267-US-26']);
    expect(buscar('T2')).toEqual(['21-US-1T2-26']);
  });

  it('sin texto no filtra', () => {
    expect(buscar('  ')).toHaveLength(VIAJES.length);
  });

  it('lee el número de la nomenclatura ya rellenado', () => {
    expect(numeroDeViaje('9-US-26')).toBe('009');
    expect(numeroDeViaje('109-MX-99T1-26')).toBe('109');
    expect(numeroDeViaje(null)).toBe('');
  });
});
