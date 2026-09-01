import { describe, it, expect } from "vitest"
import {
  aDia,
  aMes,
  etiquetaMes,
  normalizarFinanzas,
  normalizarMantenimiento,
  agruparDieselPorMes,
  ultimosMeses,
} from "../model/graficas"

describe("recortes de fecha", () => {
  it("aDia y aMes recortan una fecha ISO", () => {
    expect(aDia("2026-08-31 14:20:00")).toBe("2026-08-31")
    expect(aMes("2026-08-31 14:20:00")).toBe("2026-08")
  })

  it("toleran una fecha ausente sin reventar", () => {
    expect(aDia(null)).toBe("")
    expect(aMes(undefined)).toBe("")
  })
})

describe("etiquetaMes", () => {
  it("convierte YYYY-MM en un mes legible", () => {
    expect(etiquetaMes("2026-08")).toMatch(/2026/)
  })

  it("devuelve un guion si la clave no sirve", () => {
    expect(etiquetaMes("")).toBe("—")
    expect(etiquetaMes(null)).toBe("—")
  })

  it("no imprime NaN con una clave malformada", () => {
    expect(etiquetaMes("basura")).toBe("basura")
  })
})

describe("normalizarFinanzas", () => {
  it("convierte los montos que PHP manda como cadena", () => {
    const [fila] = normalizarFinanzas([
      { periodo: "2026-08", total_rate: "1500.50", total_paid: "1200.00" },
    ])
    expect(fila.rate).toBe(1500.5)
    expect(fila.paid).toBe(1200)
    expect(fila.label).toMatch(/2026/)
  })

  it("un monto ausente cae a 0, no a NaN", () => {
    const [fila] = normalizarFinanzas([{ periodo: "2026-08" }])
    expect(fila.rate).toBe(0)
    expect(Number.isNaN(fila.paid)).toBe(false)
  })

  it("una lista vacía o ausente da una lista vacía", () => {
    expect(normalizarFinanzas([])).toEqual([])
    expect(normalizarFinanzas()).toEqual([])
  })
})

describe("normalizarMantenimiento", () => {
  it("convierte el total y agrega la etiqueta", () => {
    const [fila] = normalizarMantenimiento([{ periodo: "2026-07", total: "980.25" }])
    expect(fila.total).toBe(980.25)
    expect(fila.label).toMatch(/2026/)
  })
})

describe("agruparDieselPorMes", () => {
  const CARGAS = [
    { fecha: "2026-08-05", monto: "100", galones: "10", fleetone: "20" },
    { fecha: "2026-08-20", monto: "50", galones: "5", fleetone: "10" },
    { fecha: "2026-07-15", monto: "200", galones: "20", fleetone: "0" },
  ]

  it("suma las cargas del mismo mes", () => {
    const agosto = agruparDieselPorMes(CARGAS).find((f) => f.month === "2026-08")
    expect(agosto.monto).toBe(150)
    expect(agosto.fleetone).toBe(30)
  })

  it("devuelve los meses en orden cronológico", () => {
    expect(agruparDieselPorMes(CARGAS).map((f) => f.month)).toEqual(["2026-07", "2026-08"])
  })

  it("agrupa bajo un guion las cargas sin fecha", () => {
    const conHuerfana = [...CARGAS, { monto: "10", fleetone: "1" }]
    expect(agruparDieselPorMes(conHuerfana).some((f) => f.month === "—")).toBe(true)
  })

  it("no devuelve NaN cuando faltan montos", () => {
    const [fila] = agruparDieselPorMes([{ fecha: "2026-08-01" }])
    expect(fila.monto).toBe(0)
    expect(Number.isNaN(fila.fleetone)).toBe(false)
  })

  it("una lista vacía da una lista vacía", () => {
    expect(agruparDieselPorMes([])).toEqual([])
  })
})

describe("ultimosMeses", () => {
  const SERIE = [1, 2, 3, 4, 5].map((n) => ({ month: `2026-0${n}` }))

  it("se queda con los últimos N", () => {
    expect(ultimosMeses(SERIE, 2).map((f) => f.month)).toEqual(["2026-04", "2026-05"])
  })

  it("pedir más de los que hay devuelve todos", () => {
    expect(ultimosMeses(SERIE, 99)).toHaveLength(5)
  })

  it("sin límite devuelve la serie completa", () => {
    expect(ultimosMeses(SERIE, 0)).toHaveLength(5)
  })
})
