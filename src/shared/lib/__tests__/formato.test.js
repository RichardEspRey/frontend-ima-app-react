import { describe, it, expect } from "vitest"
import { moneda, fechaHora, soloFecha, soloHora, decimales } from "../formato"

describe("moneda", () => {
  it("formatea una cantidad como dólares", () => {
    expect(moneda(1234.5)).toContain("1,234.50")
  })

  it("un valor ausente o ilegible se muestra como cero, no como NaN", () => {
    for (const valor of [null, undefined, "", "abc", NaN]) {
      expect(moneda(valor)).not.toContain("NaN")
      expect(moneda(valor)).toContain("0.00")
    }
  })

  it("acepta un número que viene como texto, que es como llega de PHP", () => {
    expect(moneda("1122.26")).toContain("1,122.26")
  })

  it("respeta la moneda que se le pida", () => {
    expect(moneda(100, "MXN")).toBeTruthy()
  })
})

describe("fechas", () => {
  it("formatea fecha con hora y fecha sola", () => {
    expect(fechaHora("2026-09-01 07:11:45")).toMatch(/2026/)
    expect(soloFecha("2026-09-01")).toMatch(/2026/)
  })

  it("una fecha ausente o imposible se muestra como raya", () => {
    for (const valor of [null, undefined, "", "0000-00-00", "no es fecha"]) {
      expect(fechaHora(valor)).toBe("—")
      expect(soloFecha(valor)).toBe("—")
    }
  })

  it("recorta la hora a HH:MM", () => {
    expect(soloHora("09:00:00")).toBe("09:00")
    expect(soloHora(null)).toBeNull()
  })
})

describe("decimales", () => {
  it("fija los decimales", () => {
    expect(decimales(3.14159)).toBe("3.14")
    expect(decimales(3.14159, 3)).toBe("3.142")
  })

  it("lo que no es número se muestra como cero", () => {
    expect(decimales(null)).toBe("0.00")
    expect(decimales("abc")).toBe("0.00")
  })
})
