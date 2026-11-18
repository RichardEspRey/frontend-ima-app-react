import { conCache } from './conCache';

const apiHost = import.meta.env.VITE_API_HOST;

export const VIGENCIA_UNIDADES_MS = 60 * 1000;
export const VIGENCIA_CATALOGO_MS = 5 * 60 * 1000;

const guardados = new Map();

const pedir = async (archivo, op) => {
  const respuesta = await fetch(`${apiHost}/${archivo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `op=${op}`,
  });
  return respuesta.json();
};

export const pedirCatalogo = (archivo, op, { vigenciaMs = VIGENCIA_CATALOGO_MS, forzar = false } = {}) => {
  const llave = `${archivo}#${op}`;
  if (!guardados.has(llave)) guardados.set(llave, conCache(() => pedir(archivo, op), { vigenciaMs }));
  const obtener = guardados.get(llave);
  if (forzar) obtener.invalidar();
  return obtener();
};

export const invalidarCatalogo = (archivo) => {
  guardados.forEach((obtener, llave) => {
    if (llave.startsWith(`${archivo}#`)) obtener.invalidar();
  });
};
