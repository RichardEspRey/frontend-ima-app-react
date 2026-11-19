import { normalizarTexto } from './texto';

export const reparacionesDeOrdenes = (ordenes) => {
  const unicas = new Map();
  for (const orden of ordenes ?? []) {
    for (const servicio of orden?.servicios ?? []) {
      const texto = String(servicio?.tipo_reparacion ?? '').trim();
      const llave = normalizarTexto(texto);
      if (llave && !unicas.has(llave)) unicas.set(llave, texto);
    }
  }
  return [...unicas.values()].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
};

export const ordenTieneReparacion = (orden, buscado) => {
  const texto = normalizarTexto(buscado);
  if (!texto) return true;
  return (orden?.servicios ?? []).some((servicio) => normalizarTexto(servicio?.tipo_reparacion).includes(texto));
};
