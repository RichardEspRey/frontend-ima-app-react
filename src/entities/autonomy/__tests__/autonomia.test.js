import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  promedioMpg,
  ultimoRegistro,
  totales,
  normalizarAutonomias,
} from "../model/autonomia"

const REAL = JSON.parse(
  readFileSync("src/entities/autonomy/__tests__/fixtures/get_truck_autonomy.json", "utf8"),
)

describe("promedioMpg", () => {
  it("promedia el rendimiento de los registros", () => {
    expect(promedioMpg({ registros: [{ mpg: 4 }, { mpg: 6 }] })).toBe(5)
  })

  it("ignora los registros con rendimiento 0: son cargas sin recorrido", () => {
    expect(promedioMpg({ registros: [{ mpg: 4 }, { mpg: 0 }, { mpg: 6 }] })).toBe(5)
  })

  it("sin registros útiles devuelve 0, no NaN", () => {
    expect(promedioMpg({ registros: [] })).toBe(0)
    expect(promedioMpg({ registros: [{ mpg: 0 }] })).toBe(0)
    expect(promedioMpg(undefined)).toBe(0)
  })
})

describe("ultimoRegistro", () => {
  it("devuelve el primero, que es el más reciente", () => {
    expect(ultimoRegistro({ registros: [{ fecha: "2026-04-01" }, { fecha: "2026-03-31" }] }).fecha)
      .toBe("2026-04-01")
  })

  it("sin registros devuelve null", () => {
    expect(ultimoRegistro({ registros: [] })).toBeNull()
    expect(ultimoRegistro(undefined)).toBeNull()
  })
})

describe("totales", () => {
  it("suma distancia y galones", () => {
    const t = totales({ registros: [{ distancia: 100, galones: 20 }, { distancia: 50, galones: 10 }] })
    expect(t).toEqual({ distancia: 150, galones: 30, registros: 2 })
  })

  it("sin registros da ceros, no NaN", () => {
    expect(totales({})).toEqual({ distancia: 0, galones: 0, registros: 0 })
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza los 8 camiones sin descartar ninguno", () => {
    const { autonomias, descartados } = normalizarAutonomias(REAL.data)
    expect(autonomias).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("los registros vienen anidados por camión", () => {
    const { autonomias } = normalizarAutonomias(REAL.data)
    expect(autonomias.some((a) => a.registros.length > 0)).toBe(true)
  })

  it("ningún camión real produce NaN en su promedio", () => {
    const { autonomias } = normalizarAutonomias(REAL.data)
    for (const a of autonomias) {
      expect(Number.isNaN(promedioMpg(a))).toBe(false)
      expect(promedioMpg(a)).toBeGreaterThanOrEqual(0)
    }
  })
})
