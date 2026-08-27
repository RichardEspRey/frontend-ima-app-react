import { totalUSD, totalMXN, tipoGastoPrincipal } from "./gastosValores";

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

export const esVacio = (v) => v === null || v === undefined || v === "";

export const compararValores = (a, b) => {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
};

export const siguienteOrden = (actual, campo) => {
  if (actual.campo !== campo) return { campo, dir: "asc" };
  if (actual.dir === "asc") return { campo, dir: "desc" };
  return { campo: null, dir: null };
};

export const ordenarGastos = (gastos, orden, mxnRate) => {
  const accessor = ORDEN_ACCESSORS[orden?.campo];
  if (!accessor) return gastos;

  const factor = orden.dir === "asc" ? 1 : -1;
  return [...gastos].sort((a, b) => {
    const va = accessor(a, mxnRate);
    const vb = accessor(b, mxnRate);
    const aVacio = esVacio(va);
    const bVacio = esVacio(vb);
    if (aVacio || bVacio) return aVacio && bVacio ? 0 : aVacio ? 1 : -1;
    return factor * compararValores(va, vb);
  });
};
