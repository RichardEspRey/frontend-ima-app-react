export const PERIODO_VACIO = 'V';

export const periodosDe = (texto) => {
  const periodos = String(texto ?? '')
    .split(',')
    .map((periodo) => periodo.trim().toUpperCase() || PERIODO_VACIO);
  return [...new Set(periodos)].sort(
    (a, b) => (a === PERIODO_VACIO) - (b === PERIODO_VACIO) || a.localeCompare(b)
  );
};

export const textoDePeriodos = (texto) => periodosDe(texto).join(', ');

export const tienePeriodo = (texto, buscado) =>
  periodosDe(texto).includes(buscado === 'EMPTY' ? PERIODO_VACIO : buscado);
