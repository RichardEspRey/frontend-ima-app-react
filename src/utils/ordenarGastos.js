import { totalUSD, totalMXN, tipoGastoPrincipal } from "./gastosValores";
import { esVacio, compararValores, siguienteOrden, ordenarPor } from "../shared/lib/orden";

export { esVacio, compararValores, siguienteOrden };

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

export const ordenarGastos = (gastos, orden, mxnRate) =>
  ordenarPor(gastos, orden, ORDEN_ACCESSORS, mxnRate);
