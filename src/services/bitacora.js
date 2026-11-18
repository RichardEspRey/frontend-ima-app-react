const apiHost = import.meta.env.VITE_API_HOST;

const pedir = async (op, campos = {}) => {
  const fd = new FormData();
  fd.append('op', op);
  Object.entries(campos).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') fd.append(clave, valor);
  });
  const res = await fetch(`${apiHost}/bitacora.php`, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.status !== 'success') throw new Error(data.message || 'No se pudo consultar la bitácora');
  return data;
};

export const listarBitacora = async ({ pagina, porPagina, desde_utc, hasta_utc, usuario, archivo, resultado, texto }) => {
  const data = await pedir('listar', {
    pagina,
    por_pagina: porPagina,
    desde_utc,
    hasta_utc,
    usuario_id: usuario,
    archivo,
    resultado,
    texto,
  });
  return { total: Number(data.total || 0), filas: Array.isArray(data.filas) ? data.filas : [] };
};

export const detalleBitacora = async (id) => {
  const data = await pedir('detalle', { id });
  return { fila: data.fila, cambios: Array.isArray(data.cambios) ? data.cambios : [] };
};

export const filtrosBitacora = async () => {
  const data = await pedir('getFiltros');
  return {
    usuarios: Array.isArray(data.usuarios) ? data.usuarios : [],
    archivos: Array.isArray(data.archivos) ? data.archivos : [],
  };
};
