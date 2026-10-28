import { describe, expect, it } from "vitest"
import { CATEGORIAS_DE_AVISO, buscarPersonas, nombreDe } from "../model/categorias"

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
  it("trae BL e inspecciones, cada una con sus cuatro consultas", () => {
    expect(CATEGORIAS_DE_AVISO.map((c) => c.id)).toEqual(["bl", "inspecciones"])
    for (const categoria of CATEGORIAS_DE_AVISO) {
      for (const hook of ["useSuscriptores", "useDisponibles", "useSuscribir", "useDesuscribir"]) {
        expect(typeof categoria[hook]).toBe("function")
      }
    }
  })

  it("cada endpoint recibe a la persona como la espera", () => {
    const [bl, inspecciones] = CATEGORIAS_DE_AVISO
    expect(bl.variables({ id: "20" }, "7")).toBe("20")
    expect(inspecciones.variables({ id: "20" }, "7")).toEqual({ userId: "20", usuarioId: "7" })
  })
})
