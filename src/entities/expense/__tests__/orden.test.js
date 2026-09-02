import { describe, it, expect } from "vitest";
import { ordenarGastos, siguienteOrden } from "../model/orden";

const gastos = [
  { id_gasto: 3, fecha_gasto: "2026-01-15", pais: "MX", moneda: "MXN", monto_total: 100, cantidad_original: 2000,
    created_name: "ángel", updated_name: null,
    detalles: [{ tipo_gasto: "Diesel", cantidad_articulo: 2, precio_unitario: 50 }] },
  { id_gasto: 10, fecha_gasto: "2026-03-02", pais: "US", moneda: "USD", monto_total: 0, cantidad_original: 0,
    created_name: "Zoe", updated_name: "Beto",
    detalles: [{ tipo_gasto: "Refacciones", cantidad_articulo: 3, precio_unitario: 25 }] },
  { id_gasto: 9, fecha_gasto: "2026-02-20", pais: "US", moneda: "USD", monto_total: 500, cantidad_original: 0,
    created_name: "Ana", updated_name: null, detalles: [] },
];

const ids = (lista) => lista.map((g) => g.id_gasto);
const RATE = 20;

describe("siguienteOrden (ciclo de 3 estados)", () => {
  it("asc -> desc -> sin orden", () => {
    let o = siguienteOrden({ campo: null, dir: null }, "usd");
    expect(o).toEqual({ campo: "usd", dir: "asc" });
    o = siguienteOrden(o, "usd");
    expect(o).toEqual({ campo: "usd", dir: "desc" });
    o = siguienteOrden(o, "usd");
    expect(o).toEqual({ campo: null, dir: null });
  });

  it("cambiar de columna reinicia en ascendente", () => {
    expect(siguienteOrden({ campo: "usd", dir: "desc" }, "pais")).toEqual({ campo: "pais", dir: "asc" });
  });
});

describe("ordenarGastos", () => {
  it("sin campo activo devuelve la lista del backend intacta", () => {
    expect(ids(ordenarGastos(gastos, { campo: null, dir: null }, RATE))).toEqual([3, 10, 9]);
  });

  it("ordena los ids como números, no como texto (10 va después de 9)", () => {
    expect(ids(ordenarGastos(gastos, { campo: "id_gasto", dir: "asc" }, RATE))).toEqual([3, 9, 10]);
    expect(ids(ordenarGastos(gastos, { campo: "id_gasto", dir: "desc" }, RATE))).toEqual([10, 9, 3]);
  });

  it("usa el total USD reconstruido cuando monto_total viene en cero", () => {
    expect(ids(ordenarGastos(gastos, { campo: "usd", dir: "asc" }, RATE))).toEqual([10, 3, 9]);
  });

  it("usa el monto original en pesos y no la conversión del día", () => {
    expect(ids(ordenarGastos(gastos, { campo: "mxn", dir: "desc" }, RATE))).toEqual([9, 3, 10]);
  });

  it("compara texto ignorando acentos y mayúsculas", () => {
    expect(ids(ordenarGastos(gastos, { campo: "created_name", dir: "asc" }, RATE))).toEqual([9, 3, 10]);
  });

  it("manda los vacíos al final en AMBAS direcciones", () => {
    const asc = ids(ordenarGastos(gastos, { campo: "updated_name", dir: "asc" }, RATE));
    const desc = ids(ordenarGastos(gastos, { campo: "updated_name", dir: "desc" }, RATE));
    expect(asc[asc.length - 1]).toBe(9);
    expect(desc[desc.length - 1]).toBe(9);
  });

  it("sin tasa de cambio, los gastos en USD no tienen valor en pesos y van al final", () => {
    expect(ids(ordenarGastos(gastos, { campo: "mxn", dir: "asc" }, 0))).toEqual([3, 10, 9]);
  });

  it("no muta el arreglo original", () => {
    const antes = ids(gastos);
    ordenarGastos(gastos, { campo: "id_gasto", dir: "asc" }, RATE);
    expect(ids(gastos)).toEqual(antes);
  });
});
