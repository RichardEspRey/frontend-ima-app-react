import { describe, it, expect } from "vitest"
import { validarCredenciales } from "../model/credenciales"

describe("validarCredenciales", () => {
  it("pide los dos campos", () => {
    expect(validarCredenciales({})).toMatch(/usuario y contraseña/)
    expect(validarCredenciales({ usuario: "ana" })).toMatch(/usuario y contraseña/)
    expect(validarCredenciales({ contrasena: "x" })).toMatch(/usuario y contraseña/)
  })

  it("un usuario que son solo espacios no cuenta", () => {
    expect(validarCredenciales({ usuario: "   ", contrasena: "x" })).toBeTruthy()
  })

  it("con los dos puestos deja pasar", () => {
    expect(validarCredenciales({ usuario: "ana", contrasena: "x" })).toBeNull()
  })

  it("sin argumentos no revienta", () => {
    expect(validarCredenciales()).toBeTruthy()
  })

  it("una contraseña de solo espacios sí vale: puede ser intencional", () => {
    expect(validarCredenciales({ usuario: "ana", contrasena: "   " })).toBeNull()
  })
})
