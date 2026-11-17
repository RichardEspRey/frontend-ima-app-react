import { describe, expect, it } from "vitest"
import { CATEGORIAS_DE_AVISO, SECCIONES_DE_AVISO, buscarPersonas, nombreDe, unirPersonas, seccionesDeModulo, opcionesDeModulo, MODULO_TODOS } from "../model/categorias"

const personas = [
  { id: "20", name: "Angeles", user: "Angeles_87" },
  { id: "21", name: "Celso", user: "CelsoC" },
  { id: "23", name: "", user: "Max_21028" },
]

describe("nombreDe", () => {
  it("usa el nombre, luego el usuario y al final un texto fijo", () => {
    expect(nombreDe(personas[0])).toBe("Angeles")
    expect(nombreDe(personas[2])).toBe("Max_21028")
    expect(nombreDe({})).toBe("Sin nombre")
  })
})

describe("buscarPersonas", () => {
  it("encuentra por nombre o por usuario sin importar mayúsculas", () => {
    expect(buscarPersonas(personas, "celso").map((p) => p.id)).toEqual(["21"])
    expect(buscarPersonas(personas, "21028").map((p) => p.id)).toEqual(["23"])
  })

  it("devuelve todas con el buscador vacío", () => {
    expect(buscarPersonas(personas, "  ")).toHaveLength(3)
  })
})

describe("CATEGORIAS_DE_AVISO", () => {
  it("trae un aviso por lista, cada uno con sus cuatro consultas", () => {
    expect(CATEGORIAS_DE_AVISO.map((c) => c.id)).toEqual([
      "bl",
      "viaje_programado",
      "viaje_despacho",
      "viaje_documentos",
      "inspecciones",
      "sin_fallas",
      "sin_inspeccion",
      "diesel_state",
      "diesel_fleetone",
    ])
    expect(SECCIONES_DE_AVISO.map((s) => s.id)).toEqual(["viajes", "reparaciones", "diesel"])
    for (const categoria of CATEGORIAS_DE_AVISO) {
      for (const hook of ["useSuscriptores", "useDisponibles", "useSuscribir", "useDesuscribir"]) {
        expect(typeof categoria[hook]).toBe("function")
      }
    }
  })

  it("cada endpoint recibe a la persona como la espera", () => {
    const bl = CATEGORIAS_DE_AVISO.find((c) => c.id === "bl")
    const inspecciones = CATEGORIAS_DE_AVISO.find((c) => c.id === "inspecciones")
    const diesel = CATEGORIAS_DE_AVISO.find((c) => c.id === "diesel_state")
    expect(diesel.variables({ id: "20" }, "7")).toEqual({ userId: "20", usuarioId: "7" })
    expect(bl.variables({ id: "20" }, "7")).toBe("20")
    expect(inspecciones.variables({ id: "20" }, "7")).toEqual({ userId: "20", usuarioId: "7" })
  })
})

describe("unirPersonas", () => {
  it("junta a todos sin repetir, por nombre y luego por usuario", () => {
    const unidas = unirPersonas([
      [{ id: "16", name: "Angelica", user: "Angelica_22" }, { id: 14, name: "Richard", user: "Richard" }],
      [{ id: "18", name: "Angelica", user: "Angelica_20001" }, { id: "14", name: "Richard", user: "Richard" }],
      undefined,
      [{ id: "23", name: "", user: "Max_21028" }],
    ])
    expect(unidas.map((p) => p.id)).toEqual(["18", "16", "23", "14"])
  })

  it("aguanta que no haya llegado ninguna lista", () => {
    expect(unirPersonas([undefined, undefined])).toEqual([])
  })
})

describe("nombres cortos", () => {
  it("cada aviso tiene el suyo para el encabezado de la tabla", () => {
    for (const categoria of CATEGORIAS_DE_AVISO) {
      expect(categoria.corto.length).toBeGreaterThan(0)
    }
  })
})

describe("filtro de módulo", () => {
  it("enseña todas las secciones o solo la pedida", () => {
    expect(seccionesDeModulo(MODULO_TODOS)).toHaveLength(3)
    expect(seccionesDeModulo("diesel").map((s) => s.id)).toEqual(["diesel"])
  })

  it("con un módulo que no existe no deja la tabla vacía", () => {
    expect(seccionesDeModulo("inventado")).toHaveLength(3)
  })

  it("ofrece Todos y una opción por módulo, con su cuenta", () => {
    expect(opcionesDeModulo().map((o) => o.etiqueta)).toEqual([
      "Todos · 9",
      "Viajes · 4",
      "Reparaciones · 3",
      "Diesel · 2",
    ])
  })
})
