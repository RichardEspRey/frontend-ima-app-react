/**
 * Valores derivados de un gasto.
 *
 * Viven aquí y no dentro de GastoRow porque la tabla necesita los MISMOS
 * números para ordenar que la fila para mostrar. Si se duplicaran, ordenar por
 * "Total (MX)" acomodaría por un valor y pintaría otro en cuanto una de las dos
 * copias cambiara.
 */

/** El gasto se capturó en pesos (depende del país elegido al crearlo). */
export const esGastoMXN = (gasto) =>
  String(gasto?.moneda || "").toUpperCase() === "MXN";

/** Suma de los conceptos: cantidad × precio unitario. */
export const totalDeDetalles = (gasto) =>
  (gasto?.detalles ?? []).reduce((acc, d) => {
    const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
    const pu = parseFloat(d.precio_unitario ?? 0) || 0;
    return acc + cant * pu;
  }, 0);

/**
 * Total en dólares. Se prefiere monto_total; si viene en cero (gastos viejos
 * que no lo guardaron) se reconstruye sumando los detalles.
 */
export const totalUSD = (gasto) =>
  Number(gasto?.monto_total ?? 0) > 0
    ? Number(gasto.monto_total)
    : totalDeDetalles(gasto);

/**
 * Total en pesos.
 *
 * Si el gasto se registró en MXN se usa el monto original exacto que se
 * capturó, en vez de reconvertir el total en USD con la tasa de hoy. Si se
 * registró en USD no hay un monto en pesos "real", así que se convierte con la
 * tasa del día (misma fuente que usa el formulario de Nuevo Gasto para México).
 *
 * @returns {{valor: number|null, esConvertido: boolean}} valor null = no hay
 *          tasa disponible y el gasto no es MXN, así que no hay nada que mostrar.
 */
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

/**
 * El Expense Type que representa al gasto en la tabla.
 * Un gasto puede tener varios conceptos; la columna muestra el del último.
 */
export const tipoGastoPrincipal = (gasto) => {
  const detalles = gasto?.detalles ?? [];
  return detalles.length > 0 ? detalles[detalles.length - 1]?.tipo_gasto || "" : "";
};
