export const PERMISO_PAGOS = { US: 'finanzas_pagos_us', MX: 'finanzas_pagos_mx' };

const PAISES = ['US', 'MX'];

export const paisesPermitidos = (permisos, esAdmin) => {
  const existen = PAISES.some((pais) => permisos?.[PERMISO_PAGOS[pais]] !== undefined);
  if (esAdmin || !existen) return PAISES;
  return PAISES.filter((pais) => permisos[PERMISO_PAGOS[pais]] === true);
};
