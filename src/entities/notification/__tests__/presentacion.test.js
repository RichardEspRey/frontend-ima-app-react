import { describe, it, expect } from "vitest"

import {
  agruparPorDia,
  etiquetaDeDia,
  fechaDeNotificacion,
  normalizarNotificaciones,
  tiempoRelativo,
} from "../model/notificaciones"

const AHORA = new Date("2026-09-17T10:00:00")

describe("fechaDeNotificacion", () => {
  it("lee la fecha con espacio que manda PHP", () => {
    expect(fechaDeNotificacion("2026-09-17 08:30:00")).toEqual(new Date("2026-09-17T08:30:00"))
  })

  it("devuelve null si no hay fecha o no se puede leer", () => {
    expect(fechaDeNotificacion(null)).toBeNull()
    expect(fechaDeNotificacion("")).toBeNull()
    expect(fechaDeNotificacion("ayer por la tarde")).toBeNull()
  })
})

describe("etiquetaDeDia", () => {
  it("dice Hoy y Ayer contando días de calendario, no de 24 horas", () => {
    expect(etiquetaDeDia("2026-09-17 00:10:00", AHORA)).toBe("Hoy")
    expect(etiquetaDeDia("2026-09-16 23:50:00", AHORA)).toBe("Ayer")
  })

  it("de tres días atrás da la fecha corta", () => {
    expect(etiquetaDeDia("2026-09-14 09:00:00", AHORA)).not.toMatch(/Hoy|Ayer/)
  })

  it("sin fecha lo dice en vez de inventar un día", () => {
    expect(etiquetaDeDia(null, AHORA)).toBe("Sin fecha")
  })
})

describe("tiempoRelativo", () => {
  it("cuenta minutos, horas y luego cae en la fecha", () => {
    expect(tiempoRelativo("2026-09-17 09:59:40", AHORA)).toBe("Justo ahora")
    expect(tiempoRelativo("2026-09-17 09:45:00", AHORA)).toBe("Hace 15 min")
    expect(tiempoRelativo("2026-09-17 07:00:00", AHORA)).toBe("Hace 3 h")
    expect(tiempoRelativo("2026-09-16 07:00:00", AHORA)).toBe("Ayer")
  })
})

describe("agruparPorDia", () => {
  it("agrupa conservando el orden de llegada", () => {
    const grupos = agruparPorDia(
      [
        { id: "1", mensaje: "a", created_at: "2026-09-17 09:00:00" },
        { id: "2", mensaje: "b", created_at: "2026-09-17 08:00:00" },
        { id: "3", mensaje: "c", created_at: "2026-09-16 08:00:00" },
      ],
      AHORA,
    )

    expect(grupos.map((g) => g.etiqueta)).toEqual(["Hoy", "Ayer"])
    expect(grupos[0].notificaciones.map((n) => n.id)).toEqual(["1", "2"])
    expect(grupos[1].notificaciones.map((n) => n.id)).toEqual(["3"])
  })

  it("sin notificaciones no arma grupos", () => {
    expect(agruparPorDia([], AHORA)).toEqual([])
  })
})

describe("el mensaje llega con dos nombres", () => {
  it("acepta «Mensaje», como lo manda la lista de la campana", () => {
    const { notificaciones } = normalizarNotificaciones([
      { id: "1", Mensaje: "Se subió el BL del viaje 212", trip_id: "212" },
    ])

    expect(notificaciones[0].mensaje).toBe("Se subió el BL del viaje 212")
    expect(notificaciones[0].trip_id).toBe("212")
  })

  it("si vienen los dos, manda el de minúscula", () => {
    const { notificaciones } = normalizarNotificaciones([
      { id: "1", mensaje: "el bueno", Mensaje: "el viejo" },
    ])

    expect(notificaciones[0].mensaje).toBe("el bueno")
  })
})
