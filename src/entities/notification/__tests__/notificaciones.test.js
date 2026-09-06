import { describe, it, expect } from "vitest"
import { normalizarNotificaciones, sinAnunciar } from "../model/notificaciones"

describe("normalizarNotificaciones", () => {
  it("acepta la respuesta tal como la manda PHP, con el id en texto", () => {
    const { notificaciones } = normalizarNotificaciones([
      { id: "12", mensaje: "El trip 199 llegó a destino", created_at: "2026-09-05 10:14:00" },
    ])

    expect(notificaciones).toHaveLength(1)
    expect(notificaciones[0].id).toBe("12")
  })

  it("convierte a texto un id que venga como número", () => {
    const { notificaciones } = normalizarNotificaciones([{ id: 12, mensaje: "algo" }])

    expect(notificaciones[0].id).toBe("12")
  })

  it("conserva los campos que el backend agregue sin avisar", () => {
    const { notificaciones } = normalizarNotificaciones([
      { id: "1", mensaje: "algo", tipo_nuevo: "urgente" },
    ])

    expect(notificaciones[0].tipo_nuevo).toBe("urgente")
  })

  it("descarta la que no trae mensaje, y se queda con las demás", () => {
    const { notificaciones, descartadas } = normalizarNotificaciones([
      { id: "1", mensaje: "buena" },
      { id: "2" },
      { id: "3", mensaje: "" },
      { id: "4", mensaje: "otra buena" },
    ])

    expect(notificaciones.map((n) => n.id)).toEqual(["1", "4"])
    expect(descartadas).toBe(2)
  })

  it("aguanta que el endpoint no devuelva la lista", () => {
    expect(normalizarNotificaciones(undefined)).toEqual({ notificaciones: [], descartadas: 0 })
    expect(normalizarNotificaciones(null)).toEqual({ notificaciones: [], descartadas: 0 })
    expect(normalizarNotificaciones("nada")).toEqual({ notificaciones: [], descartadas: 0 })
    expect(normalizarNotificaciones({})).toEqual({ notificaciones: [], descartadas: 0 })
  })

  it("acepta created_at nulo, que es como la manda PHP cuando no hay", () => {
    const { notificaciones } = normalizarNotificaciones([
      { id: "1", mensaje: "algo", created_at: null },
    ])

    expect(notificaciones).toHaveLength(1)
  })
})

describe("sinAnunciar", () => {
  it("devuelve solo las que no se han mostrado", () => {
    const todas = [{ id: "1" }, { id: "2" }, { id: "3" }]
    const nuevas = sinAnunciar(todas, new Set(["1", "3"]))

    expect(nuevas.map((n) => n.id)).toEqual(["2"])
  })

  it("no devuelve nada cuando ya se anunciaron todas", () => {
    expect(sinAnunciar([{ id: "1" }], new Set(["1"]))).toEqual([])
  })

  it("la primera vez devuelve todas", () => {
    expect(sinAnunciar([{ id: "1" }, { id: "2" }], new Set())).toHaveLength(2)
  })

  it("conserva el orden en que llegaron", () => {
    const todas = [{ id: "5" }, { id: "2" }, { id: "9" }]
    expect(sinAnunciar(todas, new Set(["2"])).map((n) => n.id)).toEqual(["5", "9"])
  })

  it("compara por texto: el id 12 anunciado no deja pasar al 12 numérico", () => {
    expect(sinAnunciar([{ id: "12" }], new Set(["12"]))).toEqual([])
  })
})
