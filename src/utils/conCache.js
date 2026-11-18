export function conCache(pedir, { vigenciaMs }) {
  let valor;
  let venceEn = 0;
  let enVuelo = null;

  const obtener = () => {
    if (Date.now() < venceEn) return Promise.resolve(valor);
    if (!enVuelo) {
      enVuelo = pedir()
        .then((resultado) => {
          valor = resultado;
          venceEn = Date.now() + vigenciaMs;
          return resultado;
        })
        .finally(() => {
          enVuelo = null;
        });
    }
    return enVuelo;
  };

  obtener.invalidar = () => {
    venceEn = 0;
  };

  return obtener;
}

export function crearCompletador(obtenerMapa) {
  const yaBuscados = new Set();

  return async (ids) => {
    const mapa = await obtenerMapa();
    const faltantes = [...new Set(ids.map(String))].filter((id) => !mapa.has(id) && !yaBuscados.has(id));
    if (faltantes.length === 0) return mapa;

    faltantes.forEach((id) => yaBuscados.add(id));
    obtenerMapa.invalidar();
    return obtenerMapa();
  };
}
