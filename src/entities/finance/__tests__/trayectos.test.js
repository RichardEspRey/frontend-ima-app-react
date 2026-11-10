import { describe, expect, it } from "vitest"
import {
  clavePago,
  destinosDe,
  esquemaAsignacionTrayecto,
  esquemaTrayecto,
  pesos,
  sugerirTrayecto,
} from "../model/trayectos"

const CATALOGO = [
  { id: "1", nombre: "Apodaca", monto: 3500, activo: true },
  { id: "2", nombre: "Gómez Palacio", monto: 0, activo: true },
  { id: "3", nombre: "Escobedo", monto: 2800, activo: false },
]

describe("sugerirTrayecto", () => {
  it("reconoce el destino aunque venga sin acento, con punto o con otra abreviatura", () => {
    expect(sugerirTrayecto(["Apodaca, NL."], CATALOGO)?.id).toBe("1")
    expect(sugerirTrayecto(["Apodaca NL"], CATALOGO)?.id).toBe("1")
    expect(sugerirTrayecto(["Gomez Palacios, DGO."], CATALOGO)?.id).toBe("2")
  })

  it("toma el primer destino del recorrido que coincide", () => {
    expect(sugerirTrayecto(["Gomez Palacio, DGO", "Apodaca, NL"], CATALOGO)?.id).toBe("2")
    expect(sugerirTrayecto(["Nuevo Laredo, Tamps.", "Apodaca, NL"], CATALOGO)?.id).toBe("1")
  })

  it("no sugiere trayectos desactivados ni inventa uno", () => {
    expect(sugerirTrayecto(["Escobedo, NL"], CATALOGO)).toBeNull()
    expect(sugerirTrayecto(["Santa Catarina, NLE"], CATALOGO)).toBeNull()
    expect(sugerirTrayecto([], CATALOGO)).toBeNull()
  })
})

describe("destinosDe", () => {
  it("separa el recorrido del servidor y quita los vacíos", () => {
    expect(destinosDe("Apodaca, NL | Nuevo Laredo, TAMPS|")).toEqual(["Apodaca, NL", "Nuevo Laredo, TAMPS"])
    expect(destinosDe(null)).toEqual([])
  })
})

describe("esquemas", () => {
  it("normaliza un trayecto de PHP", () => {
    expect(esquemaTrayecto.parse({ id: 1, nombre: "Apodaca", monto: "3500.00", activo: "1" })).toEqual({
      id: "1",
      nombre: "Apodaca",
      monto: 3500,
      activo: true,
    })
  })

  it("normaliza la asignación de un pago", () => {
    const fila = esquemaAsignacionTrayecto.parse({ trip_id: "584", driver_id: "31", trayecto_id: "1", trayecto: "Apodaca", monto: "3500.00" })
    expect(clavePago(fila.trip_id, fila.driver_id)).toBe("584-31")
    expect(fila.monto).toBe(3500)
  })
})

describe("pesos", () => {
  it("formatea en pesos mexicanos", () => {
    expect(pesos(3500)).toMatch(/3,500\.00/)
  })
})
