import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  ESTADO_AFINACION,
  esquemaAfinacion,
  progresoAfinacion,
  estadoAfinacion,
  millasRestantes,
  lecturasSospechosas,
  normalizarLista,
} from "../model/afinacion"

const REAL = JSON.parse(
  readFileSync("src/entities/tuning/__tests__/fixtures/get_maintenance_status.json", "utf8"),
)

describe("esquemaAfinacion", () => {
  it("convierte los números que PHP manda como cadena", () => {
    const a = esquemaAfinacion.parse(REAL.data[0])
    expect(typeof a.millas_acumuladas).toBe("number")
    expect(typeof a.limite_afinacion).toBe("number")
  })

  it("requiere_actualizacion queda como booleano", () => {
    const a = esquemaAfinacion.parse(REAL.data[0])
    expect(typeof a.requiere_actualizacion).toBe("boolean")
  })

  it("recorta la hora de la última afinación", () => {
    expect(esquemaAfinacion.parse(REAL.data[0]).ultima_afinacion_fecha).not.toContain(":")
  })

  it("un ticket_url nulo se conserva como null, no como la cadena 'null'", () => {
    const a = esquemaAfinacion.parse({ ...REAL.data[0], ticket_url: null })
    expect(a.ticket_url).toBeNull()
  })
})

describe("progresoAfinacion y estadoAfinacion", () => {
  const con = (millas, limite) => ({ millas_acumuladas: millas, limite_afinacion: limite })

  it("calcula la proporción del límite recorrida", () => {
    expect(progresoAfinacion(con(7500, 15000))).toBe(0.5)
  })

  it("un límite de 0 no da Infinity ni NaN", () => {
    expect(progresoAfinacion(con(100, 0))).toBe(0)
    expect(progresoAfinacion(undefined)).toBe(0)
  })

  it("clasifica al día, próxima y vencida", () => {
    expect(estadoAfinacion(con(1000, 15000))).toBe(ESTADO_AFINACION.AL_DIA)
    expect(estadoAfinacion(con(12500, 15000))).toBe(ESTADO_AFINACION.PROXIMA)
    expect(estadoAfinacion(con(15000, 15000))).toBe(ESTADO_AFINACION.VENCIDA)
    expect(estadoAfinacion(con(20000, 15000))).toBe(ESTADO_AFINACION.VENCIDA)
  })

  it("justo en el 80% ya cuenta como próxima", () => {
    expect(estadoAfinacion(con(12000, 15000))).toBe(ESTADO_AFINACION.PROXIMA)
  })
})

describe("millasRestantes", () => {
  it("resta lo recorrido al límite", () => {
    expect(millasRestantes({ millas_acumuladas: 10000, limite_afinacion: 15000 })).toBe(5000)
  })

  it("nunca devuelve negativo: pasado el límite son 0", () => {
    expect(millasRestantes({ millas_acumuladas: 20000, limite_afinacion: 15000 })).toBe(0)
  })
})

describe("lecturasSospechosas", () => {
  it("detecta una lectura menor que la anterior", () => {
    const registros = [
      { id_diesel: "3", odometro: 1500 },
      { id_diesel: "2", odometro: 149 },
      { id_diesel: "1", odometro: 1400 },
    ]
    expect(lecturasSospechosas(registros).map((r) => r.id_diesel)).toContain("2")
  })

  it("una secuencia correcta no da falsos positivos", () => {
    const registros = [{ odometro: 300 }, { odometro: 200 }, { odometro: 100 }]
    expect(lecturasSospechosas(registros)).toEqual([])
  })

  it("una lista vacía o de un solo registro no revienta", () => {
    expect(lecturasSospechosas([])).toEqual([])
    expect(lecturasSospechosas([{ odometro: 1 }])).toEqual([])
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza los 12 camiones sin descartar ninguno", () => {
    const { validos, descartados } = normalizarLista(REAL.data, esquemaAfinacion)
    expect(validos).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("ningún camión produce NaN en su progreso", () => {
    const { validos } = normalizarLista(REAL.data, esquemaAfinacion)
    for (const a of validos) expect(Number.isNaN(progresoAfinacion(a))).toBe(false)
  })

  it("encuentra la lectura de odómetro rota que hay en producción", () => {
    const { validos } = normalizarLista(REAL.data, esquemaAfinacion)
    const conProblemas = validos.filter((a) => lecturasSospechosas(a.ultimos_registros).length > 0)
    expect(conProblemas.length).toBeGreaterThan(0)
  })
})
