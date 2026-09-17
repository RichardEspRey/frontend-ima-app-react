import { describe, it, expect } from "vitest"

import { statusCajaDe, statusCajaValido } from "../model/statusCaja"

describe("statusCajaDe", () => {
  it("en Estados Unidos no ofrece exportación", () => {
    expect(statusCajaDe("US")).toEqual(["Impo", "Vacio"])
  })

  it("en México ofrece los tres", () => {
    expect(statusCajaDe("MX")).toEqual(["Impo", "Expo", "Vacio"])
  })

  it("con un país desconocido o sin país ofrece el juego completo", () => {
    expect(statusCajaDe("CA")).toEqual(["Impo", "Expo", "Vacio"])
    expect(statusCajaDe(undefined)).toEqual(["Impo", "Expo", "Vacio"])
  })
})

describe("statusCajaValido", () => {
  it("acepta el status que corresponde al país", () => {
    expect(statusCajaValido("Vacio", "US")).toBe(true)
    expect(statusCajaValido("Expo", "MX")).toBe(true)
  })

  it("rechaza exportación en un viaje de Estados Unidos", () => {
    expect(statusCajaValido("Expo", "US")).toBe(false)
  })

  it("rechaza lo que no es un status", () => {
    expect(statusCajaValido("", "MX")).toBe(false)
    expect(statusCajaValido("impo", "MX")).toBe(false)
  })
})
