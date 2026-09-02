import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  TODOS,
  renglonesDe,
  filtrarGastos,
  paisesDe,
  etiquetasDe,
  categoriasDeTipo,
  subcategoriasDeCategoria,
  filaPorEtiqueta,
  totalesDe,
} from "../model/gastos"
import { esGastoMXN, totalMXN, totalUSD, tipoGastoPrincipal } from "../model/valores"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/expense/__tests__/fixtures/${nombre}`, "utf8"))

const GASTOS = leer("getAllGastos.json").data
const TIPOS = leer("getExpenseTypes.json").data
const CATEGORIAS = leer("getCategories.json").data
const SUBCATEGORIAS = leer("getAllSubcategories.json").data

const TIPO_DE_CAMBIO = 17.035

describe("filtrarGastos, contra 40 gastos reales", () => {
  it("sin filtros no descarta ninguno", () => {
    expect(filtrarGastos(GASTOS)).toHaveLength(GASTOS.length)
    expect(filtrarGastos(GASTOS, {})).toHaveLength(GASTOS.length)
  })

  it("filtrar por país reparte todos los gastos sin perder ninguno", () => {
    const mx = filtrarGastos(GASTOS, { filterCountry: "MX" })
    const us = filtrarGastos(GASTOS, { filterCountry: "US" })
    expect(mx.length + us.length).toBe(GASTOS.length)
  })

  it("el buscador encuentra por folio, país y moneda", () => {
    const uno = GASTOS[0]
    expect(filtrarGastos(GASTOS, { search: uno.id_gasto })).toContain(uno)
    expect(filtrarGastos(GASTOS, { search: uno.pais.toLowerCase() })).toContain(uno)
    expect(filtrarGastos(GASTOS, { search: uno.moneda })).toContain(uno)
  })

  it("un gasto entra si CUALQUIERA de sus renglones cumple", () => {
    const conVarios = GASTOS.find((g) => renglonesDe(g).length > 1)
    if (!conVarios) return

    const ultimo = renglonesDe(conVarios).at(-1)
    expect(filtrarGastos(GASTOS, { filterType: ultimo.tipo_gasto })).toContain(conVarios)
  })

  it("la descripción se busca sin acentos, porque se captura a mano", () => {
    const gasto = {
      id_gasto: "1",
      detalles: [{ descripcion_articulo: "GASOLINA MAGNÁ" }],
    }
    expect(filtrarGastos([gasto], { filterDescription: "magna" })).toHaveLength(1)
    expect(filtrarGastos([gasto], { filterDescription: "MAGNÁ" })).toHaveLength(1)
  })

  it("filtra por rango de fechas, con los dos extremos incluidos", () => {
    const fechas = GASTOS.map((g) => g.fecha_gasto).sort()
    const desde = fechas[0]
    const enElRango = filtrarGastos(GASTOS, { startDate: desde, endDate: desde })
    expect(enElRango.length).toBeGreaterThan(0)
    for (const gasto of enElRango) expect(gasto.fecha_gasto).toBe(desde)
  })

  it("un gasto sin renglones no entra en un filtro de categoría", () => {
    const sinRenglones = { id_gasto: "9", detalles: [] }
    expect(filtrarGastos([sinRenglones], { filterCategory: "Viaticos" })).toHaveLength(0)
  })

  it("un gasto sin renglones sí pasa cuando no se filtra por ellos", () => {
    const sinRenglones = { id_gasto: "9", pais: "MX", detalles: null }
    expect(filtrarGastos([sinRenglones], { filterCountry: "MX" })).toHaveLength(1)
  })

  it("los filtros se acumulan", () => {
    const resultado = filtrarGastos(GASTOS, {
      filterCountry: "MX",
      filterDescription: "no existe esta descripción",
    })
    expect(resultado).toHaveLength(0)
  })
})

describe("los catálogos encadenados", () => {
  it("los países salen de los datos, no de una lista fija", () => {
    const paises = paisesDe(GASTOS)
    expect(paises[0]).toBe(TODOS)
    expect(paises).toContain("MX")
    expect(paises).toContain("US")
  })

  it("las etiquetas van ordenadas en español y empiezan por 'All'", () => {
    const etiquetas = etiquetasDe(TIPOS)
    expect(etiquetas[0]).toBe(TODOS)
    expect(etiquetas.slice(1)).toEqual([...etiquetas.slice(1)].sort((a, b) => a.localeCompare(b, "es")))
  })

  it("con un tipo elegido solo se ofrecen sus categorías", () => {
    const tipo = TIPOS[0]
    const suyas = categoriasDeTipo(CATEGORIAS, tipo)
    const esperadas = CATEGORIAS.filter((c) => String(c.id_tipo_gasto) === String(tipo.value))
    expect(suyas).toHaveLength(esperadas.length + 1)
  })

  it("sin tipo elegido se ofrecen todas las categorías", () => {
    expect(categoriasDeTipo(CATEGORIAS, null)).toHaveLength(CATEGORIAS.length + 1)
  })

  it("sin categoría elegida no se ofrece ninguna subcategoría", () => {
    expect(subcategoriasDeCategoria(SUBCATEGORIAS, null)).toEqual([])
  })

  it("las subcategorías reales cuelgan de su categoría", () => {
    const conHijas = CATEGORIAS.find((c) =>
      SUBCATEGORIAS.some((s) => String(s.id_categoria) === String(c.value)),
    )
    const hijas = subcategoriasDeCategoria(SUBCATEGORIAS, conHijas)
    expect(hijas.length).toBeGreaterThan(0)
  })

  it("cada subcategoría real cuelga de una categoría que existe", () => {
    const ids = new Set(CATEGORIAS.map((c) => String(c.value)))
    const huerfanas = SUBCATEGORIAS.filter((s) => !ids.has(String(s.id_categoria)))
    expect(huerfanas).toEqual([])
  })

  it("se puede volver del texto del filtro a la fila del catálogo", () => {
    const tipo = TIPOS[0]
    expect(filaPorEtiqueta(TIPOS, tipo.label)).toBe(tipo)
    expect(filaPorEtiqueta(TIPOS, "no existe")).toBeNull()
  })
})

describe("los importes", () => {
  it("todos los gastos se guardan convertidos a dólares", () => {
    for (const gasto of GASTOS) expect(Number.isFinite(totalUSD(gasto))).toBe(true)
  })

  it("un gasto en pesos usa la cantidad que de verdad se pagó, sin convertir", () => {
    const enPesos = GASTOS.find(esGastoMXN)
    const { valor, esConvertido } = totalMXN(enPesos, TIPO_DE_CAMBIO)
    expect(valor).toBe(Number(enPesos.cantidad_original))
    expect(esConvertido).toBe(false)
  })

  it("un gasto en dólares se convierte y se marca como convertido", () => {
    const enDolares = GASTOS.find((g) => !esGastoMXN(g))
    const { valor, esConvertido } = totalMXN(enDolares, TIPO_DE_CAMBIO)
    expect(valor).toBeCloseTo(totalUSD(enDolares) * TIPO_DE_CAMBIO, 2)
    expect(esConvertido).toBe(true)
  })

  it("sin tipo de cambio, un gasto en dólares no se inventa un importe en pesos", () => {
    const enDolares = GASTOS.find((g) => !esGastoMXN(g))
    expect(totalMXN(enDolares, 0).valor).toBeNull()
  })

  it("el tipo de gasto de la tabla es el del último renglón", () => {
    const conVarios = GASTOS.find((g) => renglonesDe(g).length > 1)
    if (!conVarios) return
    expect(tipoGastoPrincipal(conVarios)).toBe(renglonesDe(conVarios).at(-1).tipo_gasto)
  })
})

describe("totalesDe", () => {
  it("suma dólares y pesos de los gastos reales", () => {
    const { usd, mxn, sinConversion } = totalesDe(GASTOS, (g) => totalMXN(g, TIPO_DE_CAMBIO))
    expect(usd).toBeGreaterThan(0)
    expect(mxn).toBeGreaterThan(0)
    expect(sinConversion).toBe(0)
  })

  it("cuenta los que no se pudieron pasar a pesos en vez de dejarlos fuera en silencio", () => {
    const { mxn, sinConversion } = totalesDe(GASTOS, (g) => totalMXN(g, 0))
    const enDolares = GASTOS.filter((g) => !esGastoMXN(g)).length
    expect(sinConversion).toBe(enDolares)
    expect(Number.isFinite(mxn)).toBe(true)
  })

  it("sin gastos los totales son cero", () => {
    expect(totalesDe([], () => ({ valor: 0 }))).toEqual({ usd: 0, mxn: 0, sinConversion: 0 })
  })
})
