const DIGITOS_DE_VIAJE = 3;

const rellenar = (numero) => String(Number(numero)).padStart(DIGITOS_DE_VIAJE, '0');

export const numeroDeViaje = (nomenclatura) => {
  const inicio = String(nomenclatura ?? '').trim().match(/^\d+/);
  return inicio ? rellenar(inicio[0]) : '';
};

export const coincideViaje = (nomenclatura, busqueda) => {
  const buscado = String(busqueda ?? '').trim().toLowerCase();
  if (!buscado) return true;
  if (/^\d+$/.test(buscado)) return numeroDeViaje(nomenclatura) === rellenar(buscado);
  return String(nomenclatura ?? '').toLowerCase().includes(buscado);
};
