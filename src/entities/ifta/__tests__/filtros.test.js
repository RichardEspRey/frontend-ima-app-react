import { describe, it, expect } from "vitest"
import {
  PERIODO_VACIO,
  etiquetaPeriodo,
  filtrosTotalesIfta,
  totalConAjuste,
  periodosDisponibles,
  filtrarPeriodos,
  llavePeriodo,
} from "../model/ifta"

const REGISTROS = [
  { estado: "TX", periodo: "Q2", total_millas: 10, galones: 3, trip_year: "26" },
  { estado: "TX", periodo: "", total_millas: 5, galones: 1, trip_year: "26" },
  { estado: "AL", periodo: "Q1", total_millas: 7, galones: 2, trip_year: "25" },
  { estado: "AL", periodo: "Q2", total_millas: 4, galones: 1, trip_year: "26" },
]

describe("filtrosTotalesIfta", () => {
  it("por fechas manda solo las fechas con valor", () => {
    expect(filtrosTotalesIfta({ porViajes: false, desde: "2026-01-01", hasta: "" })).toEqual({ date_from: "2026-01-01" })
  })

  it("por viajes ignora las fechas y manda el año en dos dígitos", () => {
    expect(
      filtrosTotalesIfta({ porViajes: true, desde: "2026-01-01", viajeDesde: " 200 ", viajeHasta: "210", anio: "2026" }),
    ).toEqual({ trip_from: "200", trip_to: "210", trip_year: "26" })
  })

  it("sin nada capturado no filtra", () => {
    expect(filtrosTotalesIfta({ porViajes: true, anio: "" })).toEqual({})
    expect(filtrosTotalesIfta({ porViajes: false })).toEqual({})
  })
})

describe("totalConAjuste", () => {
  it("suma o resta el ajuste del estado", () => {
    expect(totalConAjuste({ state: "TX", total: 100 }, { TX: "25.5" })).toBe(125.5)
    expect(totalConAjuste({ state: "TX", total: 100 }, { TX: "-40" })).toBe(60)
  })

  it("un ajuste vacío o inválido no cambia el total", () => {
    expect(totalConAjuste({ state: "TX", total: 100 }, { TX: "" })).toBe(100)
    expect(totalConAjuste({ state: "TX", total: 100 }, { TX: "-" })).toBe(100)
    expect(totalConAjuste({ state: "AL", total: 100 }, { TX: "5" })).toBe(100)
  })
})

describe("periodos", () => {
  it("lista los periodos sin el vacío", () => {
    expect(periodosDisponibles(REGISTROS)).toEqual(["Q1", "Q2"])
  })

  it("PERIODO_VACIO filtra los registros sin periodo", () => {
    expect(filtrarPeriodos(REGISTROS, { periodo: PERIODO_VACIO })).toEqual([REGISTROS[1]])
  })

  it("combina periodo, estado y año", () => {
    expect(filtrarPeriodos(REGISTROS, { periodo: "Q2", estado: " tx", anio: "26" })).toEqual([REGISTROS[0]])
    expect(filtrarPeriodos(REGISTROS, {})).toHaveLength(4)
  })

  it("nombra el periodo vacío y arma la llave del registro", () => {
    expect(etiquetaPeriodo("")).toBe("Vacío")
    expect(etiquetaPeriodo("Q3")).toBe("Q3")
    expect(llavePeriodo(REGISTROS[1])).toBe("TX||26")
  })
})
