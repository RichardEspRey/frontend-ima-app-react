import { describe, it, expect } from "vitest"
import {
  PERIODO_VACIO,
  etiquetaPeriodo,
  filtrosTotalesIfta,
  totalConAjuste,
  periodosDisponibles,
  filtrarPeriodos,
  llavePeriodo,
  anioCorto,
  anioConsultable,
  describirFiltrosTotales,
  describirFiltrosPeriodos,
  normalizarGalonesIfta,
  agruparUnidadesPorEstado,
  llaveAjusteUnidad,
  ajusteDeUnidad,
  ajusteDeEstado,
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
    expect(llavePeriodo(REGISTROS[1])).toBe("TX|")
    expect(llavePeriodo({ estado: null, periodo: null })).toBe("|")
  })
})

describe("año", () => {
  it("se manda y se compara en dos dígitos", () => {
    expect(anioCorto("2026")).toBe("26")
    expect(anioCorto(" 26 ")).toBe("26")
    expect(anioCorto("")).toBe("")
    expect(anioCorto(undefined)).toBe("")
  })

  it("filtra igual con el año de dos o de cuatro dígitos", () => {
    expect(filtrarPeriodos(REGISTROS, { anio: "2026" })).toHaveLength(3)
    expect(filtrarPeriodos(REGISTROS, { anio: "26" })).toHaveLength(3)
    expect(filtrarPeriodos(REGISTROS, { anio: " 2025 " })).toEqual([REGISTROS[2]])
    expect(filtrarPeriodos(REGISTROS, { anio: "  " })).toHaveLength(4)
  })

  it("a medio teclear todavía no se consulta", () => {
    expect(anioConsultable("")).toBe(true)
    expect(anioConsultable("26")).toBe(true)
    expect(anioConsultable("2026")).toBe(true)
    expect(anioConsultable("2")).toBe(false)
    expect(anioConsultable("202")).toBe(false)
  })
})

describe("encabezados del PDF", () => {
  it("describe el rango de viajes con lo que haya capturado", () => {
    expect(
      describirFiltrosTotales({ porViajes: true, viajeDesde: " 200 ", viajeHasta: "210", anio: "2026" }),
    ).toBe("Viajes: del viaje 200, al viaje 210, año 2026")
    expect(describirFiltrosTotales({ porViajes: true, anio: "2026" })).toBe("Viajes: año 2026")
    expect(describirFiltrosTotales({ porViajes: true })).toBe("Viajes: todos")
  })

  it("describe el rango de fechas, abierto por cualquiera de los dos lados", () => {
    expect(describirFiltrosTotales({ porViajes: false })).toBe("Fechas: todas")
    expect(describirFiltrosTotales({ porViajes: false, desde: "2026-01-01" })).toBe("Fechas: 2026-01-01 a hoy")
    expect(describirFiltrosTotales({ porViajes: false, hasta: "2026-03-31" })).toBe("Fechas: inicio a 2026-03-31")
  })

  it("describe los filtros de los registros por periodo", () => {
    expect(describirFiltrosPeriodos({})).toBe("Periodo: todos   ·   Estado: todos")
    expect(describirFiltrosPeriodos({ anio: "" })).toBe("Periodo: todos   ·   Estado: todos   ·   Año: todos")
    expect(describirFiltrosPeriodos({ periodo: PERIODO_VACIO, estado: " tx ", anio: "2026" })).toBe(
      "Periodo: Vacío   ·   Estado: TX   ·   Año: 2026",
    )
  })
})

describe("galones IFTA (main 1.6.2)", () => {
  it("normaliza lo que manda galones_ifta, con estado y periodo nulos como vacío", () => {
    expect(
      normalizarGalonesIfta([
        { estado: null, total_galones: 1944.92, periodo: "Q4" },
        { estado: "TX", total_galones: "120.5", periodo: null },
      ]),
    ).toEqual([
      { estado: "", periodo: "Q4", galones: 1944.92 },
      { estado: "TX", periodo: "", galones: 120.5 },
    ])
    expect(normalizarGalonesIfta(null)).toEqual([])
  })

  it("los registros normalizados se filtran por periodo vacío y por estado", () => {
    const registros = normalizarGalonesIfta([
      { estado: "TX", total_galones: 10, periodo: null },
      { estado: null, total_galones: 5, periodo: "Q4" },
    ])
    expect(filtrarPeriodos(registros, { periodo: PERIODO_VACIO })).toHaveLength(1)
    expect(filtrarPeriodos(registros, { estado: "tx" })).toHaveLength(1)
  })
})

describe("millas por unidad", () => {
  const FILAS = [
    { state: "NM", total_state_miles: 17713.8, unidad: "5", total_truck_miles: 4036.2 },
    { state: "NM", total_state_miles: 17713.8, unidad: null, total_truck_miles: 100 },
    { state: "TX", total_state_miles: 900, unidad: "12", total_truck_miles: 900 },
  ]

  it("agrupa por estado conservando el total del estado y sus unidades", () => {
    const grupos = agruparUnidadesPorEstado(FILAS)
    expect(grupos.map((g) => g.estado)).toEqual(["NM", "TX"])
    expect(grupos[0]).toEqual({
      estado: "NM",
      total: 17713.8,
      unidades: [
        { unidad: "5", total: 4036.2 },
        { unidad: null, total: 100 },
      ],
    })
  })

  it("los ajustes suman o restan por unidad y se acumulan por estado", () => {
    const [nm] = agruparUnidadesPorEstado(FILAS)
    const ajustes = { [llaveAjusteUnidad("NM", "5")]: "-36.2", [llaveAjusteUnidad("NM", null)]: "10", "NM-9": "abc" }
    expect(llaveAjusteUnidad("NM", null)).toBe("NM-sin")
    expect(ajusteDeUnidad(ajustes, "NM", "5")).toBeCloseTo(-36.2)
    expect(ajusteDeUnidad(ajustes, "NM", "9")).toBe(0)
    expect(ajusteDeEstado(nm, ajustes)).toBeCloseTo(-26.2)
  })
})

