import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  MONTOS_DTOPS,
  construirGastoDtops,
  montoDtopsValido,
  resolverClasificacionDtops,
} from "../model/dtops"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/expense/__tests__/fixtures/${nombre}`, "utf8"))

const TIPOS = leer("getExpenseTypes.json").data
const CATEGORIAS = leer("getCategories.json").data
const SUBCATEGORIAS = leer("getAllSubcategories.json").data

const CLASIFICACION = {
  id_tipo_gasto: "9",
  id_categoria_mantenimiento: "6",
  id_subcategoria_mantenimiento: "24",
}

describe("resolverClasificacionDtops, contra el catálogo real", () => {
  it("resuelve Documentos Despacho › Puentes › Dtops", () => {
    expect(resolverClasificacionDtops(TIPOS, CATEGORIAS, SUBCATEGORIAS)).toEqual(CLASIFICACION)
  })

  it("no le importan las mayúsculas ni los espacios del catálogo", () => {
    const subcategorias = [{ value: "24", label: "  DTOPS ", id_categoria: "6" }]
    expect(resolverClasificacionDtops(TIPOS, CATEGORIAS, subcategorias)).toEqual(CLASIFICACION)
  })

  it("devuelve null si el catálogo no trae la subcategoría «Dtops»", () => {
    const sinDtops = SUBCATEGORIAS.filter((s) => s.label !== "Dtops")
    expect(resolverClasificacionDtops(TIPOS, CATEGORIAS, sinDtops)).toBeNull()
  })

  it("devuelve null si la subcategoría cuelga de una categoría que no está", () => {
    const huerfana = [{ value: "24", label: "Dtops", id_categoria: "999" }]
    expect(resolverClasificacionDtops(TIPOS, CATEGORIAS, huerfana)).toBeNull()
  })

  it("devuelve null con los catálogos vacíos o sin argumentos", () => {
    expect(resolverClasificacionDtops([], [], [])).toBeNull()
    expect(resolverClasificacionDtops()).toBeNull()
  })
})

describe("montoDtopsValido", () => {
  it("acepta los dos montos de los botones", () => {
    MONTOS_DTOPS.forEach((monto) => expect(montoDtopsValido(monto)).toBe(true))
  })

  it("acepta un importe manual escrito como texto", () => {
    expect(montoDtopsValido("13")).toBe(true)
    expect(montoDtopsValido("27.50")).toBe(true)
  })

  it("rechaza el vacío, el cero, lo negativo y lo que no es número", () => {
    expect(montoDtopsValido("")).toBe(false)
    expect(montoDtopsValido("0")).toBe(false)
    expect(montoDtopsValido(-5)).toBe(false)
    expect(montoDtopsValido("veinte")).toBe(false)
    expect(montoDtopsValido(null)).toBe(false)
    expect(montoDtopsValido(undefined)).toBe(false)
  })
})

describe("construirGastoDtops", () => {
  const archivo = new File(["x"], "dtops.pdf", { type: "application/pdf" })

  const gasto = construirGastoDtops({
    monto: "20",
    fecha: "2026-09-07",
    viaje: "1042",
    archivo,
    usuarioId: "7",
    clasificacion: CLASIFICACION,
  })

  it("es un gasto de Estados Unidos en dólares, sin tipo de cambio", () => {
    expect(gasto.generalData).toMatchObject({
      pais: "US",
      moneda: "USD",
      tipo_cambio: "",
      id_usuario: "7",
    })
  })

  it("usa la fecha capturada tanto de gasto como de ticket", () => {
    expect(gasto.generalData.fecha_gasto).toBe("2026-09-07")
    expect(gasto.generalData.fecha_ticket).toBe("2026-09-07")
  })

  it("repite el monto en el total, el original y el precio unitario", () => {
    expect(gasto.generalData.monto_total).toBe("20.00")
    expect(gasto.generalData.cantidad_original).toBe("20.00")
    expect(gasto.detailsData[0].precio_unitario).toBe("20.00")
  })

  it("lleva un solo renglón, de cantidad 1 y descrito con el número de viaje", () => {
    expect(gasto.detailsData).toHaveLength(1)
    expect(gasto.detailsData[0]).toMatchObject({
      cantidad_articulo: 1,
      descripcion_articulo: "1042",
      id_articulo: null,
      ...CLASIFICACION,
    })
  })

  it("manda el propio DTOPS como ticket del gasto", () => {
    expect(gasto.ticket_jpg_file).toBe(archivo)
  })

  it("sin archivo deja el ticket sin definir", () => {
    const sinTicket = construirGastoDtops({
      monto: 13,
      fecha: "2026-09-07",
      viaje: "1042",
      usuarioId: "7",
      clasificacion: CLASIFICACION,
    })
    expect(sinTicket.ticket_jpg_file).toBeUndefined()
    expect(sinTicket.generalData.monto_total).toBe("13.00")
  })
})
