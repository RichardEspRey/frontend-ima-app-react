import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  esquemaReparacion,
  fechaRelevante,
  totalCuadra,
  tieneDocumentos,
  normalizarReparaciones,
} from "../model/reparacion"

const REAL = JSON.parse(
  readFileSync("src/entities/roadside-repair/__tests__/fixtures/getAll.json", "utf8"),
)

describe("esquemaReparacion", () => {
  it("convierte los costos que MySQL manda como cadena", () => {
    const r = esquemaReparacion.parse(REAL.data[0])
    expect(typeof r.total).toBe("number")
    expect(typeof r.costo_reparacion).toBe("number")
  })

  it("fecha_suceso nula se conserva como null, no como cadena", () => {
    const r = esquemaReparacion.parse({ ...REAL.data[0], fecha_suceso: null })
    expect(r.fecha_suceso).toBeNull()
  })

  it("recorta la hora de las dos fechas", () => {
    const r = esquemaReparacion.parse({
      ...REAL.data[0],
      fecha_registro: "2026-08-27 14:20:00",
      fecha_suceso: "2026-08-25 09:00:00",
    })
    expect(r.fecha_registro).toBe("2026-08-27")
    expect(r.fecha_suceso).toBe("2026-08-25")
  })

  it("una reparación sin documentos da lista vacía, no undefined", () => {
    const r = esquemaReparacion.parse({ ...REAL.data[0], documentos: undefined })
    expect(r.documentos).toEqual([])
  })
})

describe("fechaRelevante", () => {
  it("prefiere la fecha del suceso", () => {
    expect(fechaRelevante({ fecha_suceso: "2026-08-25", fecha_registro: "2026-08-27" }))
      .toBe("2026-08-25")
  })

  it("cae a la de registro cuando el suceso no se capturó", () => {
    expect(fechaRelevante({ fecha_suceso: null, fecha_registro: "2026-08-27" }))
      .toBe("2026-08-27")
  })

  it("sin ninguna fecha devuelve cadena vacía, no undefined", () => {
    expect(fechaRelevante({})).toBe("")
    expect(fechaRelevante(undefined)).toBe("")
  })
})

describe("totalCuadra", () => {
  it("acepta un total que coincide con la suma", () => {
    expect(totalCuadra({ costo_reparacion: 100, costo_refacciones: 50, total: 150 })).toBe(true)
  })

  it("tolera el redondeo de MySQL", () => {
    expect(totalCuadra({ costo_reparacion: 100.005, costo_refacciones: 0, total: 100 })).toBe(true)
  })

  it("detecta un total que no cuadra", () => {
    expect(totalCuadra({ costo_reparacion: 100, costo_refacciones: 50, total: 900 })).toBe(false)
  })
})

describe("tieneDocumentos", () => {
  it("distingue con y sin adjuntos", () => {
    expect(tieneDocumentos({ documentos: [{ url: "a.pdf" }] })).toBe(true)
    expect(tieneDocumentos({ documentos: [] })).toBe(false)
    expect(tieneDocumentos(undefined)).toBe(false)
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza las 5 reparaciones sin descartar ninguna", () => {
    const { reparaciones, descartados } = normalizarReparaciones(REAL.data)
    expect(reparaciones).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("fecha_suceso está nula en todas: la columna existe pero nadie la llena aún", () => {
    const { reparaciones } = normalizarReparaciones(REAL.data)
    expect(reparaciones.every((r) => r.fecha_suceso === null)).toBe(true)
  })

  it("aun así todas tienen fecha que mostrar, por el respaldo a fecha_registro", () => {
    const { reparaciones } = normalizarReparaciones(REAL.data)
    for (const r of reparaciones) expect(fechaRelevante(r)).not.toBe("")
  })

  it("los totales reales cuadran con la suma de sus partes", () => {
    const { reparaciones } = normalizarReparaciones(REAL.data)
    for (const r of reparaciones) expect(totalCuadra(r)).toBe(true)
  })
})
