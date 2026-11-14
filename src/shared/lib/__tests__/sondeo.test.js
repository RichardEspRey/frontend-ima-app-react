import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sondear, intervaloSegunVentana } from '../sondeo';

const documento = new EventTarget();
documento.hidden = false;

const ponerOculta = (oculta) => {
  documento.hidden = oculta;
  documento.dispatchEvent(new Event('visibilitychange'));
};

describe('sondear', () => {
  beforeEach(() => {
    vi.stubGlobal('document', documento);
    vi.useFakeTimers();
    ponerOculta(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('consulta al iniciar y luego cada intervalo', async () => {
    const consultar = vi.fn().mockResolvedValue();
    const detener = sondear(consultar, { visibleMs: 1000 });
    await vi.advanceTimersByTimeAsync(0);
    expect(consultar).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(3000);
    expect(consultar).toHaveBeenCalledTimes(4);
    detener();
    await vi.advanceTimersByTimeAsync(5000);
    expect(consultar).toHaveBeenCalledTimes(4);
  });

  it('sin alIniciar espera el primer intervalo', async () => {
    const consultar = vi.fn().mockResolvedValue();
    const detener = sondear(consultar, { visibleMs: 1000, alIniciar: false });
    await vi.advanceTimersByTimeAsync(999);
    expect(consultar).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(consultar).toHaveBeenCalledTimes(1);
    detener();
  });

  it('con la ventana oculta usa el intervalo lento', async () => {
    const consultar = vi.fn().mockResolvedValue();
    const detener = sondear(consultar, { visibleMs: 1000, ocultoMs: 4000 });
    await vi.advanceTimersByTimeAsync(0);
    ponerOculta(true);
    await vi.advanceTimersByTimeAsync(3999);
    expect(consultar).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(consultar).toHaveBeenCalledTimes(2);
    detener();
  });

  it('con ocultoMs en null se detiene y consulta al volver', async () => {
    const consultar = vi.fn().mockResolvedValue();
    const detener = sondear(consultar, { visibleMs: 1000, ocultoMs: null });
    await vi.advanceTimersByTimeAsync(0);
    ponerOculta(true);
    await vi.advanceTimersByTimeAsync(60000);
    expect(consultar).toHaveBeenCalledTimes(1);
    ponerOculta(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(consultar).toHaveBeenCalledTimes(2);
    detener();
  });

  it('al volver enseguida no repite una consulta reciente', async () => {
    const consultar = vi.fn().mockResolvedValue();
    const detener = sondear(consultar, { visibleMs: 1000, ocultoMs: null });
    await vi.advanceTimersByTimeAsync(0);
    ponerOculta(true);
    await vi.advanceTimersByTimeAsync(200);
    ponerOculta(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(consultar).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(consultar).toHaveBeenCalledTimes(2);
    detener();
  });

  it('no encima consultas si la anterior no ha terminado', async () => {
    let terminar;
    const consultar = vi.fn(() => new Promise((resolve) => { terminar = resolve; }));
    const detener = sondear(consultar, { visibleMs: 1000 });
    await vi.advanceTimersByTimeAsync(10000);
    expect(consultar).toHaveBeenCalledTimes(1);
    terminar();
    await vi.advanceTimersByTimeAsync(1000);
    expect(consultar).toHaveBeenCalledTimes(2);
    detener();
  });

  it('un error no detiene el sondeo', async () => {
    const silencio = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consultar = vi.fn().mockRejectedValue(new Error('sin red'));
    const detener = sondear(consultar, { visibleMs: 1000 });
    await vi.advanceTimersByTimeAsync(2000);
    expect(consultar).toHaveBeenCalledTimes(3);
    detener();
    silencio.mockRestore();
  });
});

describe('intervaloSegunVentana', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('entrega el intervalo que toca según se vea la ventana', () => {
    const ventana = { hidden: false };
    vi.stubGlobal('document', ventana);
    const intervalo = intervaloSegunVentana(1000, 4000);
    expect(intervalo()).toBe(1000);
    ventana.hidden = true;
    expect(intervalo()).toBe(4000);
  });
});
