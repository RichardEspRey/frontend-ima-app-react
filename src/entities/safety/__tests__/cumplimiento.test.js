import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  DOCUMENTOS_REQUERIDOS,
  tieneDocumento,
  documentosFaltantes,
  cumplimientoCompleto,
  separarPorCumplimiento,
  contarFaltantes,
  normalizarViajesSafety,
} from "../model/cumplimiento"

const REAL = JSON.parse(
  readFileSync("src/entities/safety/__tests__/fixtures/get_safety_trips.json", "utf8"),
)

const completo = {
  trip_id: "1",
  libro_electronico: "a.pdf",
  reporte_diesel: "b.pdf",
  reporte_pcmiller: "c.pdf",
}

describe("tieneDocumento", () => {
  it("una URL cuenta como subido y un nulo como faltante", () => {
    expect(tieneDocumento(completo, DOCUMENTOS_REQUERIDOS.LIBRO)).toBe(true)
    expect(tieneDocumento({ libro_electronico: null }, DOCUMENTOS_REQUERIDOS.LIBRO)).toBe(false)
  })

  it("una cadena vacía cuenta como faltante, no como subido", () => {
    expect(tieneDocumento({ libro_electronico: "" }, DOCUMENTOS_REQUERIDOS.LIBRO)).toBe(false)
  })
})

describe("documentosFaltantes y cumplimientoCompleto", () => {
  it("un viaje con los tres no tiene faltantes", () => {
    expect(documentosFaltantes(completo)).toEqual([])
    expect(cumplimientoCompleto(completo)).toBe(true)
  })

  it("lista solo los que faltan", () => {
    const faltan = documentosFaltantes({ ...completo, reporte_diesel: null })
    expect(faltan).toEqual([DOCUMENTOS_REQUERIDOS.DIESEL])
  })

  it("un viaje vacío no cumple y le faltan los tres", () => {
    expect(documentosFaltantes({})).toHaveLength(3)
    expect(cumplimientoCompleto({})).toBe(false)
  })
})

describe("separarPorCumplimiento", () => {
  it("cada viaje cae en exactamente un grupo", () => {
    const viajes = [completo, { trip_id: "2" }, { ...completo, trip_id: "3" }]
    const { pendientes, completos } = separarPorCumplimiento(viajes)
    expect(completos).toHaveLength(2)
    expect(pendientes).toHaveLength(1)
    expect(pendientes.length + completos.length).toBe(viajes.length)
  })

  it("sin viajes devuelve dos listas vacías", () => {
    expect(separarPorCumplimiento()).toEqual({ pendientes: [], completos: [] })
  })
})

describe("contarFaltantes", () => {
  it("cuenta por documento, no por viaje", () => {
    const conteo = contarFaltantes([
      { libro_electronico: "a.pdf", reporte_diesel: null, reporte_pcmiller: null },
      { libro_electronico: null, reporte_diesel: null, reporte_pcmiller: "c.pdf" },
    ])
    expect(conteo[DOCUMENTOS_REQUERIDOS.LIBRO]).toBe(1)
    expect(conteo[DOCUMENTOS_REQUERIDOS.DIESEL]).toBe(2)
    expect(conteo[DOCUMENTOS_REQUERIDOS.PCMILLER]).toBe(1)
  })

  it("sin viajes da ceros, no undefined", () => {
    const conteo = contarFaltantes([])
    for (const doc of Object.values(DOCUMENTOS_REQUERIDOS)) expect(conteo[doc]).toBe(0)
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza los viajes sin descartar ninguno", () => {
    const { viajes, descartados } = normalizarViajesSafety(REAL.data)
    expect(viajes).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("los documentos nulos se conservan como null, no como la cadena 'null'", () => {
    const { viajes } = normalizarViajesSafety(REAL.data)
    const conNulo = viajes.find((v) => v.libro_electronico === null)
    expect(conNulo).toBeDefined()
  })

  it("la separación no pierde ni duplica viajes reales", () => {
    const { viajes } = normalizarViajesSafety(REAL.data)
    const { pendientes, completos } = separarPorCumplimiento(viajes)
    expect(pendientes.length + completos.length).toBe(viajes.length)
  })
})
