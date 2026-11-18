import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { conCache, crearCompletador } from '../conCache';

describe('conCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('dentro de la vigencia no vuelve a pedir', async () => {
    const pedir = vi.fn().mockResolvedValue(['a']);
    const obtener = conCache(pedir, { vigenciaMs: 1000 });
    expect(await obtener()).toEqual(['a']);
    expect(await obtener()).toEqual(['a']);
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it('dos llamadas a la vez comparten una sola petición', async () => {
    const pedir = vi.fn().mockResolvedValue(['a']);
    const obtener = conCache(pedir, { vigenciaMs: 1000 });
    await Promise.all([obtener(), obtener(), obtener()]);
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it('pasada la vigencia vuelve a pedir', async () => {
    const pedir = vi.fn().mockResolvedValue(['a']);
    const obtener = conCache(pedir, { vigenciaMs: 1000 });
    await obtener();
    vi.advanceTimersByTime(1001);
    await obtener();
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it('invalidar fuerza la siguiente petición', async () => {
    const pedir = vi.fn().mockResolvedValue(['a']);
    const obtener = conCache(pedir, { vigenciaMs: 1000 });
    await obtener();
    obtener.invalidar();
    await obtener();
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it('un fallo no se guarda: la siguiente llamada reintenta', async () => {
    const pedir = vi.fn().mockRejectedValueOnce(new Error('sin red')).mockResolvedValue(['a']);
    const obtener = conCache(pedir, { vigenciaMs: 1000 });
    await expect(obtener()).rejects.toThrow('sin red');
    expect(await obtener()).toEqual(['a']);
    expect(pedir).toHaveBeenCalledTimes(2);
  });
});

describe('crearCompletador', () => {
  const mapaDe = (pares) => new Map(pares);

  it('si están todos, usa lo guardado', async () => {
    const pedir = vi.fn().mockResolvedValue(mapaDe([['1', 'A'], ['2', 'B']]));
    const completar = crearCompletador(conCache(pedir, { vigenciaMs: 60000 }));
    await completar(['1']);
    await completar([2, '1']);
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it('si aparece un id nuevo, vuelve a pedir una vez y lo trae', async () => {
    const pedir = vi
      .fn()
      .mockResolvedValueOnce(mapaDe([['1', 'A']]))
      .mockResolvedValue(mapaDe([['1', 'A'], ['2', 'B']]));
    const completar = crearCompletador(conCache(pedir, { vigenciaMs: 60000 }));
    await completar(['1']);
    const mapa = await completar(['1', '2']);
    expect(mapa.get('2')).toBe('B');
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it('un id que el catálogo nunca trae no provoca peticiones en cada vuelta', async () => {
    const pedir = vi.fn().mockResolvedValue(mapaDe([['1', 'A']]));
    const completar = crearCompletador(conCache(pedir, { vigenciaMs: 60000 }));
    await completar(['1', '99']);
    await completar(['1', '99']);
    await completar(['1', '99']);
    expect(pedir).toHaveBeenCalledTimes(2);
  });
});
