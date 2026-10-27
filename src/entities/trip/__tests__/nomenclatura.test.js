import { describe, it, expect } from "vitest"

import { nomenclaturaViaje } from "../model/viaje"

const BASE = { trip_number: "241", country_code: "US", trip_year: "26" }

describe("nomenclaturaViaje", () => {
  it("al transnacional le pone su número y movimiento en medio", () => {
    expect(
      nomenclaturaViaje({ ...BASE, is_transnational: "1", transnational_number: "86", movement_number: "2" }),
    ).toBe("241-US-86T2-26")
  })

  it("al que no es transnacional lo deja sin segmento de en medio", () => {
    expect(
      nomenclaturaViaje({ ...BASE, is_transnational: "0", transnational_number: null, movement_number: null }),
    ).toBe("241-US-26")
  })

  it("marcado transnacional pero sin número no inventa un NoneTNone", () => {
    expect(nomenclaturaViaje({ ...BASE, is_transnational: "1", transnational_number: null })).toBe("241-US-26")
  })

  it("sin número de viaje devuelve vacío", () => {
    expect(nomenclaturaViaje({})).toBe("")
    expect(nomenclaturaViaje(null)).toBe("")
  })
})
