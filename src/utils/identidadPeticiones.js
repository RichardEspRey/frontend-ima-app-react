const esDeLaApi = (url, apiHost) => Boolean(apiHost) && String(url ?? '').startsWith(apiHost);

const conCampos = (cuerpo, campos) => {
  if (typeof FormData !== 'undefined' && cuerpo instanceof FormData) {
    const copia = new FormData();
    cuerpo.forEach((valor, clave) => copia.append(clave, valor));
    Object.entries(campos).forEach(([clave, valor]) => {
      if (!copia.has(clave)) copia.append(clave, valor);
    });
    return copia;
  }

  if (cuerpo instanceof URLSearchParams) {
    const copia = new URLSearchParams(cuerpo);
    Object.entries(campos).forEach(([clave, valor]) => {
      if (!copia.has(clave)) copia.append(clave, valor);
    });
    return copia;
  }

  if (typeof cuerpo === 'string' && /(^|&)op=/.test(cuerpo)) {
    const existentes = new URLSearchParams(cuerpo);
    const extra = Object.entries(campos)
      .filter(([clave]) => !existentes.has(clave))
      .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`);
    return extra.length > 0 ? `${cuerpo}&${extra.join('&')}` : cuerpo;
  }

  return cuerpo;
};

export const conIdentidad = (url, opciones, { apiHost, usuarioId, app }) => {
  if (!esDeLaApi(url, apiHost) || !opciones?.body) return opciones;

  const campos = { _app: app };
  if (usuarioId !== undefined && usuarioId !== null && usuarioId !== '') campos._usuario = String(usuarioId);

  const body = conCampos(opciones.body, campos);
  return body === opciones.body ? opciones : { ...opciones, body };
};

export const instalarIdentidad = ({ apiHost, app, obtenerUsuario }) => {
  if (typeof window === 'undefined' || window.fetch.__conIdentidad) return;
  const original = window.fetch.bind(window);

  const conIdentidadFetch = (url, opciones) => {
    try {
      return original(url, conIdentidad(url, opciones, { apiHost, app, usuarioId: obtenerUsuario() }));
    } catch {
      return original(url, opciones);
    }
  };

  conIdentidadFetch.__conIdentidad = true;
  window.fetch = conIdentidadFetch;
};
