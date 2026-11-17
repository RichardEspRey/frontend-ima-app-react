import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const respuesta = (cuerpo) => Promise.resolve({ json: () => Promise.resolve(cuerpo) });

const opDe = (cuerpo) =>
  typeof cuerpo === 'string' ? new URLSearchParams(cuerpo).get('op') : cuerpo.get('op');

const servidor = (catalogo, inspecciones) =>
  vi.fn((url, opciones) => {
    const op = opDe(opciones.body);
    if (op === 'All_CL_Final') return respuesta({ status: 'success', row: catalogo() });
    if (op === 'getInspecciones') return respuesta({ status: 'success', inspecciones: inspecciones() });
    return respuesta({ status: 'success' });
  });

const pedidas = (fetchMock, op) => fetchMock.mock.calls.filter(([, o]) => opDe(o.body) === op).length;

describe('catálogo de nomenclaturas', () => {
  let catalogo;
  let inspecciones;
  let fetchMock;
  let servicio;

  beforeEach(async () => {
    vi.resetModules();
    catalogo = [{ viaje_id: '605', nomenclatura: '261-US-26' }];
    inspecciones = [{ cl_final_id: '281', viaje_id: '605', estatus_lado: 'pendiente', fecha_creacion: '2026-11-15 11:58:45', operador: 'Ruben' }];
    fetchMock = servidor(() => catalogo, () => inspecciones);
    vi.stubGlobal('fetch', fetchMock);
    servicio = await import('../mantenimiento');
  });

  afterEach(() => vi.unstubAllGlobals());

  it('el sondeo de avisos pide el catálogo una vez, no en cada vuelta', async () => {
    await servicio.obtenerAvisosDeInspecciones();
    await servicio.obtenerAvisosDeInspecciones();
    const avisos = await servicio.obtenerAvisosDeInspecciones();

    expect(pedidas(fetchMock, 'All_CL_Final')).toBe(1);
    expect(pedidas(fetchMock, 'getInspecciones')).toBe(6);
    expect(avisos[0].nomenclatura).toBe('261-US-26');
  });

  it('las pantallas comparten el mismo catálogo', async () => {
    await servicio.obtenerAvisosDeInspecciones();
    await servicio.obtenerInspeccionesDeLado('camion');
    await servicio.obtenerPendientes('camion');
    expect(pedidas(fetchMock, 'All_CL_Final')).toBe(1);
  });

  it('una inspección de un viaje nuevo trae su nomenclatura en la misma vuelta', async () => {
    await servicio.obtenerAvisosDeInspecciones();

    catalogo = [...catalogo, { viaje_id: '612', nomenclatura: '267-US-26' }];
    inspecciones = [...inspecciones, { cl_final_id: '290', viaje_id: '612', estatus_lado: 'pendiente', fecha_creacion: '2026-11-17 09:00:00', operador: 'Alberto' }];
    const avisos = await servicio.obtenerAvisosDeInspecciones();

    expect(avisos.find((a) => a.clFinalId === '290').nomenclatura).toBe('267-US-26');
    expect(pedidas(fetchMock, 'All_CL_Final')).toBe(2);
  });

  it('un viaje que el catálogo no trae no hace pedirlo en cada vuelta', async () => {
    inspecciones = [...inspecciones, { cl_final_id: '291', viaje_id: '999', trip_number: '300', estatus_lado: 'pendiente', fecha_creacion: '2026-11-17 09:00:00', operador: 'X' }];
    await servicio.obtenerAvisosDeInspecciones();
    await servicio.obtenerAvisosDeInspecciones();
    const avisos = await servicio.obtenerAvisosDeInspecciones();

    expect(pedidas(fetchMock, 'All_CL_Final')).toBe(2);
    expect(avisos.find((a) => a.clFinalId === '291').nomenclatura).toBe('300');
  });
});
