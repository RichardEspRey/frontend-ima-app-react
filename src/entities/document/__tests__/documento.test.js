import { describe, it, expect } from "vitest"
import {
  ESTADO_DOCUMENTO,
  REGION,
  diasRestantes,
  estadoDocumento,
  normalizarDocumentos,
  porRegion,
} from "../model/documento"

const HOY = new Date("2026-09-01T10:30:00")

const REQUISITO_API = {
  id_requisito: "8",
  key_name: "CAAT",
  label: "CAAT",
  region: "MEX",
  tipo: "file",
  tiene_vencimiento: "1",
  activo: "1",
}

describe("diasRestantes", () => {
  it("cuenta los días que faltan", () => {
    expect(diasRestantes("2026-09-11", HOY)).toBe(10)
  })

  it("un vencimiento de hoy da 0, no un negativo por la hora", () => {
    expect(diasRestantes("2026-09-01", HOY)).toBe(0)
  })

  it("una fecha pasada da negativo", () => {
    expect(diasRestantes("2026-08-25", HOY)).toBe(-7)
  })

  it("tolera fecha con hora incluida", () => {
    expect(diasRestantes("2026-09-11 00:00:00", HOY)).toBe(10)
  })

  it("sin fecha o con basura devuelve null", () => {
    expect(diasRestantes(null, HOY)).toBeNull()
    expect(diasRestantes("", HOY)).toBeNull()
    expect(diasRestantes("no-es-fecha", HOY)).toBeNull()
  })
})

describe("estadoDocumento", () => {
  const conVencimiento = { tiene_vencimiento: true }
  const sinVencimiento = { tiene_vencimiento: false }

  it("sin captura, sale como no capturado", () => {
    expect(estadoDocumento(conVencimiento, undefined, HOY)).toBe(ESTADO_DOCUMENTO.SIN_CAPTURAR)
    expect(estadoDocumento(conVencimiento, { url_pdf: null, valor_texto: null }, HOY))
      .toBe(ESTADO_DOCUMENTO.SIN_CAPTURAR)
  })

  it("cuenta como capturado tanto un archivo como un texto", () => {
    expect(estadoDocumento(sinVencimiento, { url_pdf: "a.pdf" }, HOY)).toBe(ESTADO_DOCUMENTO.VIGENTE)
    expect(estadoDocumento(sinVencimiento, { valor_texto: "ABC123" }, HOY)).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })

  it("un requisito sin control de vigencia nunca vence", () => {
    const valor = { url_pdf: "a.pdf", fecha_vencimiento: "2020-01-01" }
    expect(estadoDocumento(sinVencimiento, valor, HOY)).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })

  it("distingue vencido, por vencer y vigente", () => {
    const con = (fecha) => ({ url_pdf: "a.pdf", fecha_vencimiento: fecha })
    expect(estadoDocumento(conVencimiento, con("2026-08-25"), HOY)).toBe(ESTADO_DOCUMENTO.VENCIDO)
    expect(estadoDocumento(conVencimiento, con("2026-09-15"), HOY)).toBe(ESTADO_DOCUMENTO.POR_VENCER)
    expect(estadoDocumento(conVencimiento, con("2026-12-31"), HOY)).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })

  it("el día 30 todavía es por vencer, el 31 ya es vigente", () => {
    const con = (fecha) => ({ url_pdf: "a.pdf", fecha_vencimiento: fecha })
    expect(estadoDocumento(conVencimiento, con("2026-10-01"), HOY)).toBe(ESTADO_DOCUMENTO.POR_VENCER)
    expect(estadoDocumento(conVencimiento, con("2026-10-02"), HOY)).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })

  it("capturado pero sin fecha se considera vigente, no vencido", () => {
    expect(estadoDocumento(conVencimiento, { url_pdf: "a.pdf" }, HOY)).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })
})

describe("normalizarDocumentos", () => {
  it("convierte los booleanos que PHP manda como cadena", () => {
    const { requisitos } = normalizarDocumentos({ requisitos: [REQUISITO_API], valores: {} })
    expect(requisitos[0].tiene_vencimiento).toBe(true)
    expect(requisitos[0].activo).toBe(true)
  })

  it("conserva `valores` como objeto indexado por key_name, no como lista", () => {
    const { valores } = normalizarDocumentos({
      requisitos: [REQUISITO_API],
      valores: { CAAT: { tipo_documento: "CAAT", url_pdf: "a.pdf" } },
    })
    expect(valores.CAAT.url_pdf).toBe("a.pdf")
  })

  it("descarta los requisitos sin key_name y los cuenta", () => {
    const { requisitos, descartados } = normalizarDocumentos({
      requisitos: [REQUISITO_API, { id_requisito: "9" }],
    })
    expect(requisitos).toHaveLength(1)
    expect(descartados).toBe(1)
  })

  it("una respuesta vacía no revienta", () => {
    expect(normalizarDocumentos()).toEqual({ requisitos: [], valores: {}, descartados: 0 })
    expect(normalizarDocumentos({})).toEqual({ requisitos: [], valores: {}, descartados: 0 })
  })
})

describe("porRegion", () => {
  const REQUISITOS = [
    { key_name: "A", region: REGION.MEXICO, activo: true },
    { key_name: "B", region: REGION.USA, activo: true },
    { key_name: "C", region: REGION.MEXICO, activo: false },
  ]

  it("separa por región", () => {
    const { mexico, usa } = porRegion(REQUISITOS)
    expect(mexico.map((r) => r.key_name)).toEqual(["A"])
    expect(usa.map((r) => r.key_name)).toEqual(["B"])
  })

  it("omite los requisitos retirados", () => {
    expect(porRegion(REQUISITOS).mexico.some((r) => r.key_name === "C")).toBe(false)
  })

  it("sin requisitos devuelve dos listas vacías", () => {
    expect(porRegion()).toEqual({ mexico: [], usa: [] })
  })
})
