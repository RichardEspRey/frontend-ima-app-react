import { totalUSD, totalMXN, tipoGastoPrincipal } from "./gastosValores";

/**
 * Ordenamiento de la tabla de gastos, estilo Excel.
 *
 * Es lógica pura y vive fuera del componente para poder verificarla sin montar
 * la pantalla completa.
 */

// Cómo se obtiene el valor de cada columna. Las tres columnas calculadas
// (tipo, usd, mxn) usan los mismos helpers que pinta GastoRow, para que la
// tabla nunca ordene por un número distinto al que muestra.
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
  // numeric:true hace que "Gasto 10" quede después de "Gasto 9", y
  // sensitivity:'base' ignora acentos y mayúsculas al comparar nombres.
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
};

/**
 * Un clic ordena ascendente, otro descendente, y el tercero vuelve al orden
 * natural que manda el backend (id_gasto DESC = lo más reciente primero).
 */
export const siguienteOrden = (actual, campo) => {
  if (actual.campo !== campo) return { campo, dir: "asc" };
  if (actual.dir === "asc") return { campo, dir: "desc" };
  return { campo: null, dir: null };
};

/**
 * Devuelve una copia ordenada. Sin campo activo devuelve la lista tal cual,
 * que es el tercer estado del ciclo.
 */
export const ordenarGastos = (gastos, orden, mxnRate) => {
  const accessor = ORDEN_ACCESSORS[orden?.campo];
  if (!accessor) return gastos;

  const factor = orden.dir === "asc" ? 1 : -1;
  return [...gastos].sort((a, b) => {
    const va = accessor(a, mxnRate);
    const vb = accessor(b, mxnRate);
    const aVacio = esVacio(va);
    const bVacio = esVacio(vb);
    // Los vacíos van al final en ambas direcciones: una columna de puros "—"
    // hasta arriba al ordenar descendente no le sirve a nadie.
    if (aVacio || bVacio) return aVacio && bVacio ? 0 : aVacio ? 1 : -1;
    return factor * compararValores(va, vb);
  });
};
