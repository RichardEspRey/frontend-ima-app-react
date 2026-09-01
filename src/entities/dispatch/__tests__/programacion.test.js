import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  PAIS,
  paisOpuesto,
  esquemaViajeTransnacional,
  formatearNumeroViaje,
  anioDosDigitos,
  agruparPorCruce,
  normalizarViajesTransnacionales,
} from "../model/programacion"

const REAL = JSON.parse(
  readFileSync("src/entities/dispatch/__tests__/fixtures/get_transnational_trips.json", "utf8"),
)

describe("paisOpuesto", () => {
  it("devuelve el otro lado de la frontera", () => {
    expect(paisOpuesto(PAIS.MEXICO)).toBe(PAIS.USA)
    expect(paisOpuesto(PAIS.USA)).toBe(PAIS.MEXICO)
  })

  it("aplicado dos veces regresa al original", () => {
    expect(paisOpuesto(paisOpuesto(PAIS.USA))).toBe(PAIS.USA)
  })
})

describe("formatearNumeroViaje", () => {
  it("arma el formato que la gente reconoce", () => {
    expect(formatearNumeroViaje({ numero: 197, pais: "US", anio: "26" })).toBe("197-US-26")
  })

  it("no imprime undefined cuando falta un dato", () => {
    expect(formatearNumeroViaje({ numero: 197 })).not.toContain("undefined")
    expect(formatearNumeroViaje({})).not.toContain("undefined")
  })
})

describe("anioDosDigitos", () => {
  it("recorta el año a dos dígitos", () => {
    expect(anioDosDigitos(new Date("2026-09-01T12:00:00"))).toBe("26")
    expect(anioDosDigitos(2026)).toBe("26")
    expect(anioDosDigitos("2026")).toBe("26")
  })
})

describe("esquemaViajeTransnacional", () => {
  it("convierte los ids que PHP manda como cadena", () => {
    const v = esquemaViajeTransnacional.parse(REAL.data[0])
    expect(typeof v.trip_id).toBe("string")
    expect(typeof v.movement_number).toBe("number")
  })

  it("un número de cruce nulo se conserva como null", () => {
    const v = esquemaViajeTransnacional.parse({ ...REAL.data[0], transnational_number: null })
    expect(v.transnational_number).toBeNull()
  })
})

describe("agruparPorCruce", () => {
  it("junta las dos mitades de un cruce", () => {
    const cruces = agruparPorCruce([
      { trip_id: "1", transnational_number: "63", country_code: "MX" },
      { trip_id: "2", transnational_number: "63", country_code: "US" },
      { trip_id: "3", transnational_number: "64", country_code: "MX" },
    ])
    expect(cruces).toHaveLength(2)
    expect(cruces.find((c) => c.numero === "63").viajes).toHaveLength(2)
  })

  it("los viajes sin cruce van a un grupo propio", () => {
    const cruces = agruparPorCruce([{ trip_id: "1", transnational_number: null }])
    expect(cruces[0].numero).toBe("sin-cruce")
  })

  it("sin viajes devuelve lista vacía", () => {
    expect(agruparPorCruce()).toEqual([])
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza los viajes sin descartar ninguno", () => {
    const { viajes, descartados } = normalizarViajesTransnacionales(REAL.data)
    expect(viajes).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("todos traen su país y su año", () => {
    const { viajes } = normalizarViajesTransnacionales(REAL.data)
    for (const v of viajes) {
      expect([PAIS.MEXICO, PAIS.USA]).toContain(v.country_code)
      expect(v.trip_year).toBeTruthy()
    }
  })

  it("agrupar por cruce no pierde ningún viaje", () => {
    const { viajes } = normalizarViajesTransnacionales(REAL.data)
    const total = agruparPorCruce(viajes).reduce((suma, c) => suma + c.viajes.length, 0)
    expect(total).toBe(viajes.length)
  })

  it("el número formateado coincide con el que usa la app", () => {
    const { viajes } = normalizarViajesTransnacionales(REAL.data)
    const v = viajes[0]
    expect(formatearNumeroViaje({ numero: v.trip_number, pais: v.country_code, anio: v.trip_year }))
      .toMatch(/^\d+-(MX|US)-\d+$/)
  })
})
