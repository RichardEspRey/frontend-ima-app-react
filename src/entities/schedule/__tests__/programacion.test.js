import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  PREFIJO_CAJA,
  valorCaja,
  leerValorCaja,
  programacionEnBlanco,
  formularioDesdePrograma,
  programacionParaGuardar,
  validarProgramacion,
  estaDisponible,
  posicionDeCamion,
} from "../model/programacion"

const TABLERO = JSON.parse(
  readFileSync("src/entities/schedule/__tests__/fixtures/dashboard.json", "utf8"),
)

describe("el selector que mezcla las dos flotas de cajas", () => {
  it("distingue la caja propia 5 de la externa 5", () => {
    expect(valorCaja(5, false)).toBe("i_5")
    expect(valorCaja(5, true)).toBe("e_5")
    expect(valorCaja(5, false)).not.toBe(valorCaja(5, true))
  })

  it("vuelve a separar el id de la flota", () => {
    expect(leerValorCaja("e_42")).toEqual({ id: "42", externa: true })
    expect(leerValorCaja("i_42")).toEqual({ id: "42", externa: false })
  })

  it("sin caja elegida no inventa un id", () => {
    expect(leerValorCaja("")).toEqual({ id: "", externa: false })
    expect(leerValorCaja()).toEqual({ id: "", externa: false })
  })

  it("los ids reales de las dos flotas se distinguen entre sí", () => {
    const propias = TABLERO.cajas.map((c) => valorCaja(c.caja_id, false))
    const externas = TABLERO.cajas_externas.map((c) => valorCaja(c.caja_externa_id, true))
    const todos = [...propias, ...externas]
    expect(new Set(todos).size).toBe(todos.length)
  })

  it("cada prefijo es de un solo carácter más el guion bajo", () => {
    expect(PREFIJO_CAJA.INTERNA).toHaveLength(2)
    expect(PREFIJO_CAJA.EXTERNA).toHaveLength(2)
  })
})

describe("formularioDesdePrograma", () => {
  it("una programación con caja propia abre el selector en la interna", () => {
    const form = formularioDesdePrograma({ caja_id: "7", driver_id: 3, truck_id: 9 })
    expect(form.caja_id).toBe("i_7")
    expect(form.operador_id).toBe("3")
    expect(form.camion_id).toBe("9")
  })

  it("una con caja externa gana sobre la propia", () => {
    const form = formularioDesdePrograma({ caja_id: "7", caja_externa_id: "42" })
    expect(form.caja_id).toBe("e_42")
  })

  it("recorta la fecha de salida a lo que acepta el campo datetime-local", () => {
    const form = formularioDesdePrograma({ salida: "2026-09-15 08:30:00" })
    expect(form.salida).toBe("2026-09-15 08:30")
  })

  it("una programación vacía no deja campos indefinidos", () => {
    const form = formularioDesdePrograma({})
    expect(Object.values(form).every((v) => v === "")).toBe(true)
  })

  it("el formulario en blanco tiene los mismos campos", () => {
    expect(Object.keys(formularioDesdePrograma({})).sort()).toEqual(
      Object.keys(programacionEnBlanco()).sort(),
    )
  })
})

describe("programacionParaGuardar", () => {
  it("la caja propia va en caja_id y la externa vacía", () => {
    const campos = programacionParaGuardar({ caja_id: "i_7" })
    expect(campos.caja_id).toBe("7")
    expect(campos.caja_externa_id).toBe("")
  })

  it("la caja externa va en caja_externa_id y la propia vacía", () => {
    const campos = programacionParaGuardar({ caja_id: "e_42" })
    expect(campos.caja_id).toBe("")
    expect(campos.caja_externa_id).toBe("42")
  })

  it("el campo que no aplica va vacío, no ausente: así se borra la asignación", () => {
    const campos = programacionParaGuardar({ caja_id: "e_42" })
    expect(campos).toHaveProperty("caja_id")
    expect(campos).toHaveProperty("caja_externa_id")
  })

  it("sin caja elegida los dos campos van vacíos", () => {
    const campos = programacionParaGuardar({ destino: "Laredo" })
    expect(campos.caja_id).toBe("")
    expect(campos.caja_externa_id).toBe("")
    expect(campos.destino).toBe("Laredo")
  })
})

describe("validarProgramacion", () => {
  it("pide destino y fecha de salida", () => {
    expect(validarProgramacion({})).toMatch(/destino/)
    expect(validarProgramacion({ destino: "Laredo" })).toMatch(/salida/)
  })

  it("con los dos puestos no se queja", () => {
    expect(validarProgramacion({ destino: "Laredo", salida: "2026-09-15T08:30" })).toBeNull()
  })
})

describe("disponibilidad, contra el tablero real", () => {
  it("separa camiones libres de ocupados", () => {
    const libres = TABLERO.trucks.filter(estaDisponible)
    expect(libres.length).toBeGreaterThan(0)
    expect(libres.length).toBeLessThanOrEqual(TABLERO.trucks.length)
  })

  it("una unidad sin la columna se asume disponible", () => {
    expect(estaDisponible({})).toBe(true)
    expect(estaDisponible({ disponible: "0" })).toBe(false)
  })
})

describe("posicionDeCamion", () => {
  it("lee la posición de los camiones reales que la traen", () => {
    const conPosicion = TABLERO.trucks.filter((c) => posicionDeCamion(c))
    for (const camion of conPosicion) {
      const { lat, lon } = posicionDeCamion(camion)
      expect(Number.isFinite(lat)).toBe(true)
      expect(Number.isFinite(lon)).toBe(true)
    }
  })

  it("un camión sin GPS no da NaN sino null", () => {
    expect(posicionDeCamion({ last_latitude: null, last_longitude: null })).toBeNull()
    expect(posicionDeCamion({})).toBeNull()
    expect(posicionDeCamion({ last_latitude: "", last_longitude: "" })).toBeNull()
  })
})
