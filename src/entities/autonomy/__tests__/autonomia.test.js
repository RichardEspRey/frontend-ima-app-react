import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  REGISTROS_POR_CAMION,
  NIVEL_RENDIMIENTO,
  nivelRendimiento,
  registrosEnCasillas,
  esquemaAutonomia,
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

describe("los registros de un camión", () => {
  const REGISTRO = { fecha: "2026-04-01 21:29:17", mpg: 4.4, distancia: 764, galones: 172.49 }

  it("un registro vacío se omite sin tirar los demás", () => {
    const camion = esquemaAutonomia.parse({ truck_id: "1", unidad: "1", registros: [REGISTRO, null, REGISTRO] })
    expect(camion.registros).toHaveLength(2)
  })

  it("se acomodan siempre en cinco casillas, con null en las vacías", () => {
    const casillas = registrosEnCasillas({ registros: [REGISTRO, REGISTRO] })
    expect(casillas).toHaveLength(REGISTROS_POR_CAMION)
    expect(casillas.filter(Boolean)).toHaveLength(2)
    expect(casillas[4]).toBeNull()
  })

  it("la respuesta real entra completa, con sus cinco registros por camión", () => {
    const { autonomias, descartados } = normalizarAutonomias(REAL.data)
    expect(descartados).toBe(0)
    expect(autonomias.every((a) => a.registros.length === REGISTROS_POR_CAMION)).toBe(true)
  })
})

describe("nivelRendimiento", () => {
  it("siete o más es bueno; desde 5.5, regular; abajo, bajo", () => {
    expect(nivelRendimiento(7)).toBe(NIVEL_RENDIMIENTO.BUENO)
    expect(nivelRendimiento(6.99)).toBe(NIVEL_RENDIMIENTO.REGULAR)
    expect(nivelRendimiento(5.5)).toBe(NIVEL_RENDIMIENTO.REGULAR)
    expect(nivelRendimiento(5.49)).toBe(NIVEL_RENDIMIENTO.BAJO)
  })

  it("sin un número positivo no hay dato", () => {
    expect(nivelRendimiento(0)).toBe(NIVEL_RENDIMIENTO.SIN_DATO)
    expect(nivelRendimiento(null)).toBe(NIVEL_RENDIMIENTO.SIN_DATO)
    expect(nivelRendimiento("x")).toBe(NIVEL_RENDIMIENTO.SIN_DATO)
  })
})
