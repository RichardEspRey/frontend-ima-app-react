import { describe, it, expect } from "vitest"
import { esUrlSegura, urlSegura, enlaceExterno, URL_INERTE } from "../urls"

describe("esUrlSegura", () => {
  it("acepta http y https", () => {
    expect(esUrlSegura("http://imaexpressllc.com/Uploads/doc.pdf")).toBe(true)
    expect(esUrlSegura("https://imaexpressllc.com/Uploads/doc.pdf")).toBe(true)
  })

  it("acepta rutas relativas, que no pueden ejecutar nada", () => {
    expect(esUrlSegura("/Uploads/Trips/factura.pdf")).toBe(true)
    expect(esUrlSegura("./factura.pdf")).toBe(true)
    expect(esUrlSegura("../factura.pdf")).toBe(true)
  })

  it("rechaza las que heredan el protocolo de la página", () => {
    expect(esUrlSegura("//evil.example.com/x.js")).toBe(false)
  })

  it("rechaza javascript: en todas sus formas", () => {
    expect(esUrlSegura("javascript:alert(1)")).toBe(false)
    expect(esUrlSegura("JavaScript:alert(1)")).toBe(false)
    expect(esUrlSegura("  javascript:alert(1)")).toBe(false)
    expect(esUrlSegura("java\tscript:alert(1)")).toBe(false)
    expect(esUrlSegura("java\nscript:alert(1)")).toBe(false)
    expect(esUrlSegura("java\u0000script:alert(1)")).toBe(false)
  })

  it("rechaza los otros esquemas que sí ejecutan o leen del disco", () => {
    expect(esUrlSegura("vbscript:msgbox(1)")).toBe(false)
    expect(esUrlSegura("data:text/html,<script>alert(1)</script>")).toBe(false)
    expect(esUrlSegura("file:///etc/passwd")).toBe(false)
    expect(esUrlSegura("smb://servidor/carpeta")).toBe(false)
  })

  it("rechaza lo que no es texto o está vacío", () => {
    expect(esUrlSegura(null)).toBe(false)
    expect(esUrlSegura(undefined)).toBe(false)
    expect(esUrlSegura(42)).toBe(false)
    expect(esUrlSegura({})).toBe(false)
    expect(esUrlSegura("")).toBe(false)
    expect(esUrlSegura("   ")).toBe(false)
  })
})

describe("urlSegura", () => {
  it("devuelve la URL cuando es de fiar, sin espacios alrededor", () => {
    expect(urlSegura("  https://imaexpressllc.com/a.pdf  ")).toBe(
      "https://imaexpressllc.com/a.pdf",
    )
  })

  it("neutraliza la URL cuando no lo es", () => {
    expect(urlSegura("javascript:alert(document.cookie)")).toBe(URL_INERTE)
    expect(urlSegura(null)).toBe(URL_INERTE)
  })
})

describe("enlaceExterno", () => {
  it("siempre pone noopener y noreferrer juntos", () => {
    expect(enlaceExterno("https://imaexpressllc.com/a.pdf")).toEqual({
      href: "https://imaexpressllc.com/a.pdf",
      target: "_blank",
      rel: "noopener noreferrer",
    })
  })

  it("mantiene las protecciones aunque la URL sea mala", () => {
    const props = enlaceExterno("javascript:alert(1)")
    expect(props.href).toBe(URL_INERTE)
    expect(props.rel).toBe("noopener noreferrer")
  })
})
