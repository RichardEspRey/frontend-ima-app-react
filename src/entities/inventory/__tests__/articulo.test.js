import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { normalizarArticulos, estaAgotado, agruparPorCategoria, sinNombre } from "../model/articulo"

const REAL = JSON.parse(
  readFileSync("src/entities/inventory/__tests__/fixtures/getFullInventoryList.json", "utf8"),
)

describe("normalizarArticulos", () => {
  it("convierte el stock que PHP manda como cadena", () => {
    const { articulos } = normalizarArticulos([
      { id_articulo: "1", nombre_articulo: "Filtro", cantidad_stock: "7" },
    ])
    expect(articulos[0].cantidad_stock).toBe(7)
  })

  it("conserva los artículos sin nombre en vez de descartarlos", () => {
    const { articulos, descartados } = normalizarArticulos([
      { id_articulo: "1", nombre_articulo: "Filtro", cantidad_stock: "1" },
      { id_articulo: "2", nombre_articulo: "", cantidad_stock: "3" },
    ])
    expect(articulos).toHaveLength(2)
    expect(descartados).toBe(0)
    expect(sinNombre(articulos[1])).toBe(true)
  })

  it("un stock ausente cae a 0, no a NaN", () => {
    const { articulos } = normalizarArticulos([{ id_articulo: "1", nombre_articulo: "X" }])
    expect(articulos[0].cantidad_stock).toBe(0)
  })
})

describe("estaAgotado", () => {
  it("cero o menos cuenta como agotado", () => {
    expect(estaAgotado({ cantidad_stock: 0 })).toBe(true)
    expect(estaAgotado({ cantidad_stock: -1 })).toBe(true)
    expect(estaAgotado({ cantidad_stock: 3 })).toBe(false)
  })

  it("un artículo ausente no revienta", () => {
    expect(estaAgotado(undefined)).toBe(true)
  })
})

describe("agruparPorCategoria", () => {
  const ARTICULOS = [
    { nombre_articulo: "A", nombre_categoria: "Refacciones" },
    { nombre_articulo: "B", nombre_categoria: "Basicos" },
    { nombre_articulo: "C", nombre_categoria: "Refacciones" },
  ]

  it("agrupa y ordena las categorías alfabéticamente", () => {
    const grupos = agruparPorCategoria(ARTICULOS)
    expect(grupos.map((g) => g.categoria)).toEqual(["Basicos", "Refacciones"])
    expect(grupos[1].articulos).toHaveLength(2)
  })

  it("los artículos sin categoría van a un grupo propio", () => {
    const grupos = agruparPorCategoria([{ nombre_articulo: "X", nombre_categoria: "" }])
    expect(grupos[0].categoria).toBe("Sin categoría")
  })

  it("sin artículos devuelve lista vacía", () => {
    expect(agruparPorCategoria()).toEqual([])
  })
})

describe("contra la respuesta real de la API", () => {
  it("no pierde ningún artículo, ni los que no tienen nombre", () => {
    const { articulos, descartados } = normalizarArticulos(REAL.data)
    expect(articulos).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("hay artículos sin nombre en producción y quedan marcados", () => {
    const { articulos } = normalizarArticulos(REAL.data)
    const rotos = articulos.filter(sinNombre)
    expect(rotos.length).toBeGreaterThan(0)
  })

  it("el stock queda como número en todos", () => {
    const { articulos } = normalizarArticulos(REAL.data)
    for (const a of articulos) {
      expect(typeof a.cantidad_stock).toBe("number")
      expect(Number.isNaN(a.cantidad_stock)).toBe(false)
    }
  })

  it("los artículos reales se agrupan en varias categorías", () => {
    const { articulos } = normalizarArticulos(REAL.data)
    expect(agruparPorCategoria(articulos).length).toBeGreaterThan(1)
  })
})
