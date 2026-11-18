import { describe, it, expect } from 'vitest';
import { accionDe, moduloDe, horaLocal, inicioDelDiaEnUtc, rangoEnUtc, hoyLocal, restarDias, leerDatos, textoDeApp } from '../model/bitacora';

describe('textos de la bitácora', () => {
  it('traduce las operaciones conocidas', () => {
    expect(accionDe('Auth.php', 'new_login')).toBe('Inició sesión');
    expect(accionDe('Notifications.php', 'desuscribir')).toBe('Quitó a alguien de un aviso');
    expect(accionDe('save_expense.php', 'deleteExpense')).toBe('Borró un gasto');
  });

  it('a una operación nueva le da un texto por su verbo, sin esconder su nombre', () => {
    expect(accionDe('trucks.php', 'deleteTruck')).toBe('Borró en Camiones (deleteTruck)');
    expect(accionDe('raro.php', 'hacerAlgo')).toBe('hacerAlgo en raro');
  });

  it('nombra el módulo por el archivo', () => {
    expect(moduloDe('mtto.php')).toBe('Reparaciones');
    expect(moduloDe('nuevo.php')).toBe('nuevo');
  });
});

describe('horas de la bitácora', () => {
  it('muestra en hora de Monterrey lo guardado en UTC', () => {
    expect(horaLocal('2026-11-17 16:05:09')).toBe('17/11/2026 10:05:09');
    expect(horaLocal('2026-11-18 02:00:00')).toBe('17/11/2026 20:00:00');
    expect(horaLocal('')).toBe('');
  });

  it('convierte un día de Monterrey al rango UTC que cubre el día completo', () => {
    expect(inicioDelDiaEnUtc('2026-11-17')).toBe('2026-11-17 06:00:00');
    expect(rangoEnUtc({ desde: '2026-11-17', hasta: '2026-11-17' })).toEqual({
      desde_utc: '2026-11-17 06:00:00',
      hasta_utc: '2026-11-18 06:00:00',
    });
    expect(rangoEnUtc({ desde: '2026-11-30', hasta: '2026-12-31' }).hasta_utc).toBe('2027-01-01 06:00:00');
    expect(rangoEnUtc({})).toEqual({ desde_utc: '', hasta_utc: '' });
  });

  it('el día de hoy es el de Monterrey, no el de UTC', () => {
    expect(hoyLocal(new Date('2026-11-18T03:00:00Z'))).toBe('2026-11-17');
    expect(restarDias('2026-11-03', 7)).toBe('2026-10-27');
  });
});

describe('leerDatos', () => {
  it('convierte los datos guardados en renglones clave-valor', () => {
    expect(leerDatos('{"user_id":"18","categoria":"diesel_state","pass":"***"}')).toEqual([
      ['user_id', '18'],
      ['categoria', 'diesel_state'],
      ['pass', '***'],
    ]);
    expect(leerDatos('{"_archivos":[{"nombre":"a.pdf","bytes":10}]}')[0][1]).toBe('[{"nombre":"a.pdf","bytes":10}]');
  });

  it('aguanta datos recortados o vacíos', () => {
    expect(leerDatos('{"a":"12…')).toEqual([['datos', '{"a":"12…']]);
    expect(leerDatos(null)).toEqual([]);
  });
});

describe('textoDeApp', () => {
  it('con versión la muestra; sin versión dice que la app no está actualizada', () => {
    expect(textoDeApp({ app: 'Desktop', app_version: '1.6.2' })).toBe('Desktop 1.6.2');
    expect(textoDeApp({ app: 'Movil', app_version: null })).toBe('Movil · sin actualizar');
    expect(textoDeApp({ app: 'Desktop' })).toBe('Desktop · sin actualizar');
  });

  it('lo que no es una de las apps se muestra tal cual, y sin dato queda el respaldo', () => {
    expect(textoDeApp({ app: 'Navegador' })).toBe('Navegador');
    expect(textoDeApp({ app: null })).toBe('—');
    expect(textoDeApp({}, 'App sin identificar')).toBe('App sin identificar');
  });
});
