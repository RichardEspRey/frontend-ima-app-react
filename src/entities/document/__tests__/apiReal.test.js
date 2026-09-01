import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { normalizarDocumentos, porRegion, estadoDocumento } from "../model/documento"

/*
 * La fixture es una respuesta REAL de IMA_Docsv2.php, capturada con curl el
 * 2026-09-01. Existe porque los tests que simulan la respuesta reproducen la
 * suposición de quien los escribe: así se descubrió tarde, en el incremento 6,
 * que el campo de plataforma se llama `plataform` y no `app`.
 *
 * Si la API cambia de forma, estos tests fallan y avisan.
 */
const RESPUESTA_REAL = JSON.parse(
  readFileSync("src/entities/document/__tests__/fixtures/getAll.json", "utf8"),
)

describe("contra la respuesta real de la API", () => {
  it("`valores` viene como objeto, no como lista", () => {
    expect(Array.isArray(RESPUESTA_REAL.valores)).toBe(false)
    expect(typeof RESPUESTA_REAL.valores).toBe("object")
  })

  it("normaliza los 8 requisitos sin descartar ninguno", () => {
    const { requisitos, descartados } = normalizarDocumentos(RESPUESTA_REAL)
    expect(requisitos).toHaveLength(RESPUESTA_REAL.requisitos.length)
    expect(descartados).toBe(0)
  })

  it("conserva todos los valores capturados", () => {
    const { valores } = normalizarDocumentos(RESPUESTA_REAL)
    expect(Object.keys(valores)).toHaveLength(Object.keys(RESPUESTA_REAL.valores).length)
  })

  it("las dos regiones traen requisitos", () => {
    const { requisitos } = normalizarDocumentos(RESPUESTA_REAL)
    const { mexico, usa } = porRegion(requisitos)
    expect(mexico.length).toBeGreaterThan(0)
    expect(usa.length).toBeGreaterThan(0)
  })

  it("cada requisito recibe un estado, ninguno queda indefinido", () => {
    const { requisitos, valores } = normalizarDocumentos(RESPUESTA_REAL)
    for (const req of requisitos) {
      expect(estadoDocumento(req, valores[req.key_name])).toBeTruthy()
    }
  })

  it("los booleanos de PHP quedan como booleanos de verdad", () => {
    const { requisitos } = normalizarDocumentos(RESPUESTA_REAL)
    for (const req of requisitos) {
      expect(typeof req.tiene_vencimiento).toBe("boolean")
      expect(typeof req.activo).toBe("boolean")
    }
  })
})
