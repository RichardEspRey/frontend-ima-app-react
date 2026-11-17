import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { guardarNomenclaturas, leerNomenclaturas } from '../nomenclaturasGuardadas';

const DIA = 24 * 60 * 60 * 1000;

describe('nomenclaturas guardadas en el navegador', () => {
  let almacen;

  beforeEach(() => {
    almacen = {};
    vi.stubGlobal('localStorage', {
      getItem: (llave) => almacen[llave] ?? null,
      setItem: (llave, valor) => {
        almacen[llave] = valor;
      },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lo guardado se recupera en la siguiente sesión', () => {
    guardarNomenclaturas({ 606: '262-US-97T2-26', 591: '252-US-92T2-26' });
    expect(leerNomenclaturas()).toEqual({ 606: '262-US-97T2-26', 591: '252-US-92T2-26' });
  });

  it('guardar más no borra lo anterior', () => {
    guardarNomenclaturas({ 606: '262-US-97T2-26' });
    guardarNomenclaturas({ 591: '252-US-92T2-26' });
    expect(Object.keys(leerNomenclaturas()).sort()).toEqual(['591', '606']);
  });

  it('a los 30 días se olvida, por si el viaje cambió', () => {
    const hoy = Date.now();
    guardarNomenclaturas({ 606: '262-US-97T2-26' }, hoy - 31 * DIA);
    guardarNomenclaturas({ 591: '252-US-92T2-26' }, hoy - 29 * DIA);
    expect(leerNomenclaturas(hoy)).toEqual({ 591: '252-US-92T2-26' });
  });

  it('no guarda vacíos y conserva solo las 300 más recientes', () => {
    const hoy = Date.now();
    guardarNomenclaturas({ 1: '' }, hoy);
    expect(leerNomenclaturas(hoy)).toEqual({});

    for (let i = 0; i < 305; i += 1) guardarNomenclaturas({ [`v${i}`]: `${i}-US-26` }, hoy + i);
    const guardadas = leerNomenclaturas(hoy + 400);
    expect(Object.keys(guardadas)).toHaveLength(300);
    expect(guardadas.v0).toBeUndefined();
    expect(guardadas.v304).toBe('304-US-26');
  });

  it('aguanta que el navegador no deje leer ni escribir', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    });
    expect(leerNomenclaturas()).toEqual({});
    expect(() => guardarNomenclaturas({ 606: 'x' })).not.toThrow();
  });
});
