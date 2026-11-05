import { describe, it, expect } from "vitest"
import { mesesMoviles, margenPorMes } from "../model/margen"

describe("mesesMoviles", () => {
  it("son los 12 meses que terminan en el actual, cruzando el año", () => {
    const meses = mesesMoviles(new Date(2026, 10, 5))
    expect(meses).toHaveLength(12)
    expect(meses[0]).toEqual({ anio: 2025, mes: 12 })
    expect(meses[11]).toEqual({ anio: 2026, mes: 11 })
  })
})

describe("margenPorMes", () => {
  const meses = mesesMoviles(new Date(2026, 10, 5))
  const viaje = (creation_date, total_rate, diesel, driver_pay) => ({
    creation_date,
    total_rate,
    diesel,
    driver_pay,
    totalMargin: total_rate - diesel - driver_pay,
  })

  it("reparte por mes de creación y suma el margen", () => {
    const filas = margenPorMes(
      [viaje("2026-10-02 08:00:00", 1000, 300, 200), viaje("2026-10-30 23:59:59", 500, 100, 100)],
      meses
    )
    const octubre = filas.find((f) => f.etiqueta === "Oct 26")
    expect(octubre.viajes).toBe(2)
    expect(octubre.margen).toBe(800)
  })

  it("los porcentajes salen de los totales del mes, no del promedio por viaje", () => {
    const filas = margenPorMes(
      [viaje("2026-10-02", 1000, 300, 200), viaje("2026-10-15", 3000, 300, 600)],
      meses
    )
    const octubre = filas.find((f) => f.etiqueta === "Oct 26")
    expect(octubre.pctDiesel).toBeCloseTo(15)
    expect(octubre.pctDriver).toBeCloseTo(20)
  })

  it("un mes sin tarifa no tiene porcentaje", () => {
    const filas = margenPorMes([], meses)
    expect(filas.every((f) => f.pctDiesel === null && f.pctDriver === null)).toBe(true)
  })

  it("ignora los viajes fuera de la ventana o sin fecha", () => {
    const filas = margenPorMes([viaje("2025-11-30", 1000, 0, 0), viaje("", 1000, 0, 0)], meses)
    expect(filas.reduce((suma, f) => suma + f.viajes, 0)).toBe(0)
  })
})
