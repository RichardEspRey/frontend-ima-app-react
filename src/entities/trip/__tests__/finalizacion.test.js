import { describe, it, expect } from "vitest"

import { ahoraParaCampo, cuerpoFinalizacion, validarFechasFinalizacion } from "../model/finalizacion"

const AHORA = new Date(2026, 9, 21, 18, 30)

describe("validarFechasFinalizacion", () => {
  it("pide las dos fechas", () => {
    expect(validarFechasFinalizacion({ inicio: "", fin: "2026-10-21T10:00" }, AHORA)).toMatch(/Selecciona/)
  })

  it("no acepta una fecha final en el futuro", () => {
    expect(
      validarFechasFinalizacion({ inicio: "2026-10-20T08:00", fin: "2026-10-22T08:00" }, AHORA),
    ).toMatch(/futura/)
  })

  it("el inicio tiene que ir antes que el final", () => {
    expect(
      validarFechasFinalizacion({ inicio: "2026-10-21T10:00", fin: "2026-10-21T10:00" }, AHORA),
    ).toMatch(/anterior/)
  })

  it("un rango en el pasado se puede finalizar", () => {
    expect(validarFechasFinalizacion({ inicio: "2026-10-18T07:15", fin: "2026-10-21T17:40" }, AHORA)).toBeNull()
  })
})

describe("cuerpoFinalizacion", () => {
  it("manda las fechas con segundos, como las guarda MySQL", () => {
    expect(cuerpoFinalizacion({ inicio: "2026-10-18T07:15", fin: "2026-10-21T17:40" })).toEqual({
      fecha_inicio: "2026-10-18 07:15:00",
      fecha_finalizacion: "2026-10-21 17:40:00",
    })
  })
})

describe("ahoraParaCampo", () => {
  it("da la hora local en el formato del campo", () => {
    expect(ahoraParaCampo(AHORA)).toBe("2026-10-21T18:30")
  })
})
