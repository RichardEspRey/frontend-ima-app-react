import { describe, it, expect } from "vitest"

import {
  LADO_ESCANEO,
  bodegaParecida,
  camposPropuestos,
  cambiosDeEtapa,
  paradaDelLado,
  valoresMarcados,
} from "../model/coincidencia"

const BODEGAS = [
  { value: "4", label: "Frontera Cold Storage LLC" },
  { value: "9", label: "HEB Warehouse San Antonio" },
]

describe("bodegaParecida", () => {
  it("encuentra la bodega aunque el documento no traiga «LLC»", () => {
    expect(bodegaParecida("FRONTERA COLD STORAGE", BODEGAS)?.value).toBe("4")
  })

  it("no adivina cuando se parecen poco", () => {
    expect(bodegaParecida("Cold Logistics Partners", BODEGAS)).toBeNull()
  })
})

describe("paradaDelLado", () => {
  it("el destino prefiere la entrega y, si no hay, usa la recolección", () => {
    expect(paradaDelLado({ pickup: { name: "A" }, delivery: { name: "B" } }, LADO_ESCANEO.DESTINO).name).toBe("B")
    expect(paradaDelLado({ pickup: { name: "A" }, delivery: null }, LADO_ESCANEO.DESTINO).name).toBe("A")
  })
})

describe("camposPropuestos", () => {
  it("una bodega que no existe se propone para crear, pero sin marcar", () => {
    const campos = camposPropuestos({ name: "Nueva Bodega", city: "Laredo", state: "TX", zip: "78045", date: "" }, BODEGAS)
    expect(campos.warehouse).toEqual({
      value: { create: true, name: "Nueva Bodega", label: 'Crear bodega "Nueva Bodega"' },
      checked: false,
    })
    expect(campos.city).toEqual({ value: "Laredo, TX", checked: true })
    expect(campos.date).toEqual({ value: null, checked: false })
  })
})

describe("cambiosDeEtapa", () => {
  it("solo aplica lo marcado y lo manda a los campos del lado", () => {
    const valores = valoresMarcados({
      warehouse: { value: BODEGAS[0], checked: true },
      city: { value: "Laredo, TX", checked: false },
      zip: { value: "78045", checked: true },
      date: { value: "2026-10-21", checked: true },
    })
    const { bodegaNueva, cambios } = cambiosDeEtapa(valores, LADO_ESCANEO.ORIGEN)
    expect(bodegaNueva).toBeNull()
    expect(cambios.map(([campo]) => campo)).toEqual(["warehouse_origin_id", "zip_code_origin", "loading_date"])
    expect(cambios[2][1].getDate()).toBe(21)
  })

  it("una bodega nueva se pide crear en su campo", () => {
    const resultado = cambiosDeEtapa({ warehouse: { create: true, name: "Nueva" } }, LADO_ESCANEO.DESTINO)
    expect(resultado).toMatchObject({ bodegaNueva: "Nueva", campoBodega: "warehouse_destination_id", cambios: [] })
  })
})
