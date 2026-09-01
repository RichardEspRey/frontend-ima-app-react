import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  esquemaPeriodoIfta,
  esquemaTotalEstado,
  rendimientoEstado,
  totalesIfta,
  agruparPorAnio,
  normalizarLista,
} from "../model/ifta"

const REAL = JSON.parse(
  readFileSync("src/entities/ifta/__tests__/fixtures/periodos.json", "utf8"),
)

describe("esquemaPeriodoIfta", () => {
  it("convierte millas y galones a número", () => {
    const p = esquemaPeriodoIfta.parse(REAL.data[0])
    expect(typeof p.total_millas).toBe("number")
    expect(typeof p.galones).toBe("number")
  })

  it("tolera el periodo vacío que devuelve la API", () => {
    expect(esquemaPeriodoIfta.parse({ estado: "TX", periodo: "" }).periodo).toBe("")
  })
})

describe("rendimientoEstado", () => {
  it("divide millas entre galones", () => {
    expect(rendimientoEstado({ total_millas: 1000, galones: 200 })).toBe(5)
  })

  it("sin galones cargados da 0, no Infinity", () => {
    expect(rendimientoEstado({ total_millas: 1000, galones: 0 })).toBe(0)
    expect(Number.isFinite(rendimientoEstado({ total_millas: 500 }))).toBe(true)
  })

  it("un registro ausente no revienta", () => {
    expect(rendimientoEstado(undefined)).toBe(0)
  })
})

describe("totalesIfta", () => {
  it("suma millas y galones de todos los estados", () => {
    const t = totalesIfta([
      { total_millas: 100, galones: 20 },
      { total_millas: 300, galones: 60 },
    ])
    expect(t).toEqual({ millas: 400, galones: 80, estados: 2 })
  })

  it("sin registros da ceros", () => {
    expect(totalesIfta([])).toEqual({ millas: 0, galones: 0, estados: 0 })
  })
})

describe("agruparPorAnio", () => {
  it("agrupa y ordena del año más reciente al más antiguo", () => {
    const grupos = agruparPorAnio([
      { trip_year: "25", estado: "TX" },
      { trip_year: "26", estado: "TX" },
      { trip_year: "25", estado: "AL" },
    ])
    expect(grupos.map((g) => g.anio)).toEqual(["26", "25"])
    expect(grupos[1].registros).toHaveLength(2)
  })

  it("los registros sin año van a un grupo propio", () => {
    expect(agruparPorAnio([{ estado: "TX" }])[0].anio).toBe("—")
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza los periodos sin descartar ninguno", () => {
    const { validos, descartados } = normalizarLista(REAL.data, esquemaPeriodoIfta)
    expect(validos).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("ningún estado real produce Infinity ni NaN en su rendimiento", () => {
    const { validos } = normalizarLista(REAL.data, esquemaPeriodoIfta)
    for (const r of validos) {
      const mpg = rendimientoEstado(r)
      expect(Number.isFinite(mpg)).toBe(true)
      expect(mpg).toBeGreaterThanOrEqual(0)
    }
  })

  it("el total de millas cuadra con la suma de los estados", () => {
    const { validos } = normalizarLista(REAL.data, esquemaPeriodoIfta)
    const t = totalesIfta(validos)
    const suma = validos.reduce((s, r) => s + r.total_millas, 0)
    expect(t.millas).toBeCloseTo(suma, 2)
  })

  it("el esquema de totales por estado acepta su forma", () => {
    const { validos } = normalizarLista(
      [{ state: "AL", total: 78487.3, trips: 182 }],
      esquemaTotalEstado,
    )
    expect(validos[0].trips).toBe(182)
  })
})
