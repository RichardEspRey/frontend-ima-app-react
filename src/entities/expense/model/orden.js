import { totalUSD, totalMXN, tipoGastoPrincipal } from "./valores";
import { esVacio, compararValores, siguienteOrden, ordenarPor } from "../../../shared/lib/orden";

export { esVacio, compararValores, siguienteOrden };

/**
 * Cómo se lee cada columna ordenable de la tabla de gastos.
 *
 * Ordenar por pesos necesita el tipo de cambio, porque la mitad de los gastos
 * están en dólares y hay que convertirlos para compararlos con los demás.
 *
 * @readonly
 * @enum {Function}
 */
export const ORDEN_ACCESSORS = {
  id_gasto:     (g) => Number(g.id_gasto),
  tipo:         (g) => tipoGastoPrincipal(g),
  fecha_gasto:  (g) => g.fecha_gasto || "",
  pais:         (g) => g.pais || "",
  usd:          (g) => totalUSD(g),
  mxn:          (g, rate) => totalMXN(g, rate).valor,
  created_name: (g) => g.created_name || "",
  updated_name: (g) => g.updated_name || "",
};

/**
 * Ordena los gastos por la columna elegida.
 *
 * @param {Array} gastos Los gastos a ordenar.
 * @param {object} orden `{campo, dir}`; `dir` en `null` deja el orden original.
 * @param {(number|string)} mxnRate El tipo de cambio, para la columna en pesos.
 * @returns {Array} Los gastos ordenados.
 */
export const ordenarGastos = (gastos, orden, mxnRate) =>
  ordenarPor(gastos, orden, ORDEN_ACCESSORS, mxnRate);
