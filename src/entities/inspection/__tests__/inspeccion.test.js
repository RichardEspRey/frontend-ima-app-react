import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  esquemaInspeccion,
  sinMulta,
  cuentaViolaciones,
  totalCuadra,
  normalizarInspecciones,
} from "../model/inspeccion"

const REAL = JSON.parse(
  readFileSync("src/entities/inspection/__tests__/fixtures/getAll.json", "utf8"),
)

describe("esquemaInspeccion", () => {
  it("convierte las multas que MySQL manda como cadena", () => {
    const i = esquemaInspeccion.parse(REAL.data[0])
    expect(typeof i.multa_ima).toBe("number")
    expect(typeof i.multa_driver).toBe("number")
  })

  it("toma los reportes ya parseados, no la cadena reportes_json", () => {
    const i = esquemaInspeccion.parse(REAL.data[0])
    expect(Array.isArray(i.reportes)).toBe(true)
  })

  it("una inspección sin reportes da lista vacía", () => {
    const i = esquemaInspeccion.parse({ ...REAL.data[0], reportes: undefined })
    expect(i.reportes).toEqual([])
  })
})

describe("sinMulta", () => {
  it("una inspección limpia no es un dato faltante", () => {
    expect(sinMulta({ multa_ima: 0, multa_driver: 0 })).toBe(true)
  })

  it("cualquier multa la marca como no limpia", () => {
    expect(sinMulta({ multa_ima: 500, multa_driver: 0 })).toBe(false)
    expect(sinMulta({ multa_ima: 0, multa_driver: 250 })).toBe(false)
  })
})

describe("cuentaViolaciones", () => {
  it("cuenta los reportes", () => {
    expect(cuentaViolaciones({ reportes: [{}, {}] })).toBe(2)
  })

  it("sin reportes da 0, no undefined", () => {
    expect(cuentaViolaciones({})).toBe(0)
    expect(cuentaViolaciones(undefined)).toBe(0)
  })
})

describe("totalCuadra", () => {
  it("el total es la suma de las dos multas", () => {
    expect(totalCuadra({ multa_ima: 300, multa_driver: 200, total: 500 })).toBe(true)
    expect(totalCuadra({ multa_ima: 300, multa_driver: 200, total: 100 })).toBe(false)
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza las inspecciones sin descartar ninguna", () => {
    const { inspecciones, descartados } = normalizarInspecciones(REAL.data)
    expect(inspecciones).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("todas las inspecciones registradas están sin multa", () => {
    const { inspecciones } = normalizarInspecciones(REAL.data)
    expect(inspecciones.every(sinMulta)).toBe(true)
  })

  it("los totales reales cuadran con la suma de las multas", () => {
    const { inspecciones } = normalizarInspecciones(REAL.data)
    for (const i of inspecciones) expect(totalCuadra(i)).toBe(true)
  })

  it("los reportes llegan parseados y con contenido", () => {
    const { inspecciones } = normalizarInspecciones(REAL.data)
    expect(inspecciones.some((i) => cuentaViolaciones(i) > 0)).toBe(true)
  })
})
