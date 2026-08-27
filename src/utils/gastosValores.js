export const esGastoMXN = (gasto) =>
  String(gasto?.moneda || "").toUpperCase() === "MXN";

export const totalDeDetalles = (gasto) =>
  (gasto?.detalles ?? []).reduce((acc, d) => {
    const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
    const pu = parseFloat(d.precio_unitario ?? 0) || 0;
    return acc + cant * pu;
  }, 0);

export const totalUSD = (gasto) =>
  Number(gasto?.monto_total ?? 0) > 0
    ? Number(gasto.monto_total)
    : totalDeDetalles(gasto);

export const totalMXN = (gasto, mxnRate) => {
  const cantidadOriginal = Number(gasto?.cantidad_original ?? 0);
  const rate = parseFloat(mxnRate) || 0;

  if (esGastoMXN(gasto) && cantidadOriginal > 0) {
    return { valor: cantidadOriginal, esConvertido: false };
  }
  if (rate > 0) {
    return { valor: totalUSD(gasto) * rate, esConvertido: true };
  }
  return { valor: null, esConvertido: false };
};

export const tipoGastoPrincipal = (gasto) => {
  const detalles = gasto?.detalles ?? [];
  return detalles.length > 0 ? detalles[detalles.length - 1]?.tipo_gasto || "" : "";
};
