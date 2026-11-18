import { describe, it, expect } from 'vitest';
import { nombreDeTrayecto, sugerirTrayecto, trayectosPorCrear } from '../pagosMx';

const CATALOGO = [
  { id: '1', nombre: 'Apodaca', monto: 3500, activo: true },
  { id: '2', nombre: 'Gómez Palacio', monto: 6000, activo: true },
  { id: '3', nombre: 'Escobedo', monto: 2800, activo: false },
];

describe('sugerirTrayecto', () => {
  it('reconoce el trayecto aunque el destino venga escrito distinto', () => {
    expect(sugerirTrayecto(['Apodaca, NL.', 'Nuevo Laredo, Tamps.'], CATALOGO).id).toBe('1');
    expect(sugerirTrayecto(['Gomez Palacios, DGO.', 'Nuevo Laredo, TAMPS'], CATALOGO).id).toBe('2');
  });

  it('no sugiere un trayecto dado de baja', () => {
    expect(sugerirTrayecto(['Escobedo, NL'], CATALOGO)).toBeNull();
  });

  it('prefiere el destino real sobre Nuevo Laredo, aunque Nuevo Laredo vaya primero', () => {
    const conBase = [...CATALOGO, { id: '9', nombre: 'Nuevo Laredo', monto: 0, activo: true }];
    expect(sugerirTrayecto(['Nuevo Laredo, Tamps.', 'Apodaca, NL'], conBase).id).toBe('1');
    expect(sugerirTrayecto(['Nuevo Laredo, Tamps.'], conBase).id).toBe('9');
  });
});

describe('nombreDeTrayecto', () => {
  it('toma la ciudad del primer destino que no es Nuevo Laredo', () => {
    expect(nombreDeTrayecto(['Santa Catarina, NL', 'Nuevo Laredo, Tamps.'])).toBe('Santa Catarina');
    expect(nombreDeTrayecto(['Nuevo Laredo, Tamps.', 'San Nicolás de los Garza, NL.'])).toBe('San Nicolás de los Garza');
    expect(nombreDeTrayecto(['Saltillo, COH.'])).toBe('Saltillo');
    expect(nombreDeTrayecto(['Cadereyta Jimenez, NL.'])).toBe('Cadereyta Jimenez');
  });

  it('si el viaje solo va a Nuevo Laredo, el trayecto es Nuevo Laredo', () => {
    expect(nombreDeTrayecto(['Nuevo Laredo, Tamps.'])).toBe('Nuevo Laredo');
  });

  it('sin recorrido no hay nombre', () => {
    expect(nombreDeTrayecto([])).toBe('');
  });
});

describe('trayectosPorCrear', () => {
  it('solo propone los destinos que no coinciden con ningún trayecto', () => {
    const viajes = [
      { recorrido: ['Apodaca, NL', 'Nuevo Laredo, TAMPS'] },
      { recorrido: ['Santa Catarina, NL', 'Nuevo Laredo, Tamps.'] },
      { recorrido: ['Monterrey, NL'] },
    ];
    expect(trayectosPorCrear(viajes, CATALOGO)).toEqual(['Santa Catarina', 'Monterrey']);
  });

  it('no repite un destino aunque venga escrito de varias formas', () => {
    const viajes = [{ recorrido: ['Monterrey, NL'] }, { recorrido: ['Monterrey, Nuevo León'] }, { recorrido: ['monterrey'] }];
    expect(trayectosPorCrear(viajes, CATALOGO)).toEqual(['Monterrey']);
  });

  it('no vuelve a crear uno que existe pero está dado de baja', () => {
    expect(trayectosPorCrear([{ recorrido: ['Escobedo, NL'] }], CATALOGO)).toEqual([]);
  });

  it('ignora los viajes sin recorrido', () => {
    expect(trayectosPorCrear([{ recorrido: [] }, {}], CATALOGO)).toEqual([]);
  });
});
