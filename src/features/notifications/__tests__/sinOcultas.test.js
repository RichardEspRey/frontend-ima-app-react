import { describe, expect, it } from "vitest"
import { llaveOcultas, llaveVistas, sinOcultas } from "../model/useCampanaNotificaciones"

describe("sinOcultas", () => {
  it("quita las que la persona ya abrió, sea BL o inspección", () => {
    const notificaciones = [{ id: 1 }, { id: "inspeccion-264-caja" }, { id: 3 }]
    const quedan = sinOcultas(notificaciones, new Set(["1", "inspeccion-264-caja"]))
    expect(quedan).toEqual([{ id: 3 }])
  })

  it("no quita nada si no se ha abierto ninguna", () => {
    expect(sinOcultas([{ id: 1 }], new Set())).toHaveLength(1)
  })
})

describe("llaveOcultas", () => {
  it("va por persona y no choca con la de leídas", () => {
    expect(llaveOcultas(14)).toBe("notificaciones-ocultas-14")
    expect(llaveOcultas(14)).not.toBe(llaveVistas(14))
  })
})
