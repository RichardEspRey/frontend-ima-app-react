import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('pedirCatalogo', () => {
  let fetchMock;
  let catalogos;
  let companias;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    companias = [{ company_id: '1', nombre_compania: 'PALOS GARZA HUB' }];
    fetchMock = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ status: 'success', companies: companias }) }));
    vi.stubGlobal('fetch', fetchMock);
    catalogos = await import('../catalogos');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('seis formularios que montan a la vez hacen una sola petición', async () => {
    await Promise.all(Array.from({ length: 6 }, () => catalogos.pedirCatalogo('companies.php', 'getCompanies')));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].body).toBe('op=getCompanies');
  });

  it('abrir el formulario otra vez dentro de la vigencia no pide nada', async () => {
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    vi.advanceTimersByTime(4 * 60 * 1000);
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('después de dar de alta una compañía, forzar trae la lista nueva y la deja para los demás', async () => {
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    companias = [...companias, { company_id: '2', nombre_compania: 'NUEVA' }];

    const forzada = await catalogos.pedirCatalogo('companies.php', 'getCompanies', { forzar: true });
    const siguiente = await catalogos.pedirCatalogo('companies.php', 'getCompanies');

    expect(forzada.companies).toHaveLength(2);
    expect(siguiente.companies).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('cada catálogo tiene su propia vigencia y no se mezclan', async () => {
    await catalogos.pedirCatalogo('trucks.php', 'getTrucksActivos', { vigenciaMs: catalogos.VIGENCIA_UNIDADES_MS });
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    vi.advanceTimersByTime(61 * 1000);
    await catalogos.pedirCatalogo('trucks.php', 'getTrucksActivos', { vigenciaMs: catalogos.VIGENCIA_UNIDADES_MS });
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('invalidarCatalogo descarta lo guardado de ese archivo', async () => {
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    catalogos.invalidarCatalogo('companies.php');
    await catalogos.pedirCatalogo('companies.php', 'getCompanies');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
