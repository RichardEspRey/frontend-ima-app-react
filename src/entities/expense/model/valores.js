/**
 * Indica si un gasto se capturó en pesos.
 *
 * @param {object} gasto El gasto a revisar.
 * @returns {boolean} `true` si la moneda es MXN.
 */
export const esGastoMXN = (gasto) =>
  String(gasto?.moneda || "").toUpperCase() === "MXN";

/**
 * Lo que suman los renglones de un gasto.
 *
 * Es el respaldo de `totalUSD` cuando el total guardado viene en cero.
 *
 * @param {object} gasto El gasto con sus detalles.
 * @returns {number} La suma de cantidad por precio unitario.
 */
export const totalDeDetalles = (gasto) =>
  (gasto?.detalles ?? []).reduce((acc, d) => {
    const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
    const pu = parseFloat(d.precio_unitario ?? 0) || 0;
    return acc + cant * pu;
  }, 0);

/**
 * El total de un gasto en dólares.
 *
 * Todos los gastos se guardan convertidos a dólares en `monto_total`, sea cual
 * sea la moneda en que se capturaron. Cuando ese campo viene en cero se recurre
 * a la suma de los renglones.
 *
 * @param {object} gasto El gasto a sumar.
 * @returns {number} El total en dólares.
 */
export const totalUSD = (gasto) =>
  Number(gasto?.monto_total ?? 0) > 0
    ? Number(gasto.monto_total)
    : totalDeDetalles(gasto);

/**
 * El total de un gasto en pesos.
 *
 * Un gasto capturado en México ya trae la cantidad en pesos que se pagó de
 * verdad —`cantidad_original`—, y esa es la que vale. Uno capturado en dólares
 * se convierte con el tipo de cambio del día, y se marca como convertido para
 * que en pantalla se distinga de una cifra real.
 *
 * @param {object} gasto El gasto a convertir.
 * @param {(number|string)} mxnRate El tipo de cambio del día.
 * @returns {{valor: (number|null), esConvertido: boolean}} El importe y si se convirtió.
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
 * El tipo de gasto con el que se identifica un gasto de varios renglones.
 *
 * Se toma el **último** renglón, no el primero: es el criterio que ya usaba la
 * pantalla y con el que la gente lee la tabla.
 *
 * @param {object} gasto El gasto a etiquetar.
 * @returns {string} El tipo, o cadena vacía si no hay renglones.
 */
export const tipoGastoPrincipal = (gasto) => {
  const detalles = gasto?.detalles ?? [];
  return detalles.length > 0 ? detalles[detalles.length - 1]?.tipo_gasto || "" : "";
};
