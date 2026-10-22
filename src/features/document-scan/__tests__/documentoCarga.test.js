import { describe, it, expect } from "vitest"

import { agruparRenglones, interpretarDocumentoCarga, leerFecha, leerHora, puntaje } from "../model/documentoCarga"

const palabras = (filas) =>
  filas.flatMap(([y, celdas]) =>
    celdas.flatMap(([x, texto]) => {
      let cursor = x
      return texto.split(" ").map((t) => {
        const palabra = { text: t, x0: cursor, x1: cursor + t.length * 7, yc: y, h: 12 }
        cursor += t.length * 7 + 5
        return palabra
      })
    }),
  )

const leer = (filas) => interpretarDocumentoCarga(agruparRenglones(palabras(filas)))

describe("interpretarDocumentoCarga", () => {
  it("lee las secciones con etiqueta de shipper y consignee", () => {
    const { pickup, delivery } = leer([
      [10, [[10, "RATE CONFIRMATION"]]],
      [30, [[10, "SHIPPER: ACME FOODS INC"]]],
      [45, [[10, "1200 Industrial Blvd"]]],
      [60, [[10, "Laredo, TX 78045"]]],
      [75, [[10, "Pick Up Date: 10/21/2026"], [300, "Appt Time: 2:30 PM"]]],
      [100, [[10, "CONSIGNEE: WALMART DC 6020"]]],
      [115, [[10, "500 Commerce St"]]],
      [130, [[10, "St. Louis MO 63101-1234"]]],
      [145, [[10, "Delivery Date: Oct 23, 2026"], [300, "Delivery Time: 08:00"]]],
    ])
    expect(pickup).toEqual({
      name: "ACME FOODS INC", city: "Laredo", state: "TX", zip: "78045", date: "2026-10-21", time: "14:30",
    })
    expect(delivery).toEqual({
      name: "WALMART DC 6020", city: "St. Louis", state: "MO", zip: "63101", date: "2026-10-23", time: "08:00",
    })
  })

  it("lee una tabla y corrige las letras que el OCR confunde con números", () => {
    const { pickup, delivery } = leer([
      [10, [[10, "Pickup Information"]]],
      [30, [[10, "Shipper"], [150, "City"], [250, "State"], [320, "Zip"], [400, "Date"], [500, "Time"]]],
      [45, [[10, "Frontera Cold"], [150, "Laredo"], [250, "TX"], [320, "78O45"], [400, "10/2l/26"], [500, "07:00"]]],
      [80, [[10, "Consignee"], [150, "City"], [250, "State"], [320, "Zip"], [400, "Date"]]],
      [95, [[10, "HEB Warehouse"], [150, "San Antonio"], [250, "TX"], [320, "78219"], [400, "10/22/2026"]]],
    ])
    expect(pickup).toMatchObject({ name: "Frontera Cold", zip: "78045", date: "2026-10-21", time: "07:00" })
    expect(delivery).toMatchObject({ name: "HEB Warehouse", city: "San Antonio", zip: "78219" })
  })

  it("sin estructura reconocible no inventa nada", () => {
    const resultado = leer([[10, [[10, "Nada que leer aqui"]]]])
    expect(resultado.pickup).toBeNull()
    expect(resultado.delivery).toBeNull()
    expect(puntaje(resultado)).toBe(0)
  })
})

describe("leerFecha y leerHora", () => {
  it("entienden los formatos de EUA", () => {
    expect(leerFecha("1-5-26")).toBe("2026-01-05")
    expect(leerFecha("Oct 3, 2026")).toBe("2026-10-03")
    expect(leerFecha("13/40/2026")).toBe("")
    expect(leerHora("12:05 am")).toBe("00:05")
    expect(leerHora("2:30 PM")).toBe("14:30")
  })
})
