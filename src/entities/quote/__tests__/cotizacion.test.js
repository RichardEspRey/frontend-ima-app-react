import { describe, it, expect } from "vitest"
import {
  ubicacionVacia,
  cotizacionDesdeApi,
  cotizacionParaGuardar,
  recalcularTarifa,
  millasTotales,
} from "../model/cotizacion"

const GUARDADA = {
  id: "7",
  nombre: "Laredo → Dallas",
  guardado_en: "2026-09-01 10:00:00",
  tarifa: "3200",
  millas_total: "620",
  rate: "5.1613",
  origen_nombre: "Laredo, TX",
  origen_lat: "27.5064",
  origen_lon: "-99.5075",
  destino_nombre: "Dallas, TX",
  destino_lat: "32.7767",
  destino_lon: "-96.797",
  origen_camion_nombre: "Monterrey, NL",
  origen_camion_lat: "25.6866",
  origen_camion_lon: "-100.3161",
  millas_viaje: "430.5",
  millas_vacias: "189.5",
  paradas: [{ nombre: "San Antonio, TX", lat: "29.4241", lon: "-98.4936" }],
}

describe("cotizacionDesdeApi", () => {
  it("convierte las columnas planas en ubicaciones", () => {
    const cotizacion = cotizacionDesdeApi(GUARDADA)
    expect(cotizacion.origen).toEqual({
      input: "Laredo, TX",
      geo: { lat: 27.5064, lon: -99.5075 },
    })
    expect(cotizacion.paradas).toHaveLength(1)
    expect(cotizacion.paradas[0].geo.lat).toBeCloseTo(29.4241, 4)
  })

  it("las coordenadas llegan como texto y salen como número", () => {
    const cotizacion = cotizacionDesdeApi(GUARDADA)
    expect(typeof cotizacion.origen.geo.lat).toBe("number")
    expect(typeof cotizacion.millasViaje).toBe("number")
  })

  it("sin origen de camión deja la ubicación vacía, no a medias", () => {
    const cotizacion = cotizacionDesdeApi({ ...GUARDADA, origen_camion_nombre: null })
    expect(cotizacion.origenCamion).toEqual(ubicacionVacia())
  })

  it("una coordenada ausente no produce NaN", () => {
    const cotizacion = cotizacionDesdeApi({ origen_nombre: "X", origen_lat: "", origen_lon: null })
    expect(cotizacion.origen.geo).toBeNull()
    expect(cotizacion.millasViaje).toBeNull()
  })

  it("una cotización sin paradas devuelve lista vacía", () => {
    expect(cotizacionDesdeApi({ ...GUARDADA, paradas: undefined }).paradas).toEqual([])
  })
})

describe("cotizacionParaGuardar", () => {
  it("aplana las ubicaciones en las columnas que espera la base", () => {
    const campos = cotizacionParaGuardar(cotizacionDesdeApi(GUARDADA))
    expect(campos.origen_lat).toBe(27.5064)
    expect(campos.destino_nombre).toBe("Dallas, TX")
  })

  it("solo guarda las paradas que se resolvieron en el mapa", () => {
    const campos = cotizacionParaGuardar({
      paradas: [
        { input: "Con geo", geo: { lat: 1, lon: 2 } },
        { input: "Sin geo", geo: null },
        { input: "   ", geo: { lat: 3, lon: 4 } },
      ],
    })
    expect(campos.paradas_json).toHaveLength(1)
    expect(campos.paradas_json[0].nombre).toBe("Con geo")
  })

  it("una cotización a medias no manda undefined en ningún campo", () => {
    const campos = cotizacionParaGuardar({ nombre: "Borrador" })
    for (const valor of Object.values(campos)) expect(valor).not.toBeUndefined()
  })
})

describe("recalcularTarifa", () => {
  it("al escribir la tarifa calcula el rate por milla", () => {
    const r = recalcularTarifa({ tarifa: "", millas: "620", rate: "" }, "tarifa", "3200")
    expect(r.rate).toBe("5.1613")
  })

  it("al escribir el rate calcula la tarifa", () => {
    const r = recalcularTarifa({ tarifa: "", millas: "620", rate: "" }, "rate", "5")
    expect(r.tarifa).toBe("3100.00")
  })

  it("al cambiar las millas recalcula el rate si ya hay tarifa", () => {
    const r = recalcularTarifa({ tarifa: "3200", millas: "", rate: "" }, "millas", "800")
    expect(r.rate).toBe("4.0000")
  })

  it("al cambiar las millas calcula la tarifa si lo que hay es el rate", () => {
    const r = recalcularTarifa({ tarifa: "", millas: "", rate: "5" }, "millas", "800")
    expect(r.tarifa).toBe("4000.00")
  })

  it("cero millas no divide entre cero", () => {
    const r = recalcularTarifa({ tarifa: "3200", millas: "0", rate: "" }, "tarifa", "3200")
    expect(r.rate).toBe("")
    expect(Number.isNaN(Number(r.rate))).toBe(false)
  })

  it("vaciar un campo no inventa números en los otros", () => {
    const r = recalcularTarifa({ tarifa: "3200", millas: "620", rate: "5" }, "tarifa", "")
    expect(r.tarifa).toBe("")
    expect(r.rate).toBe("5")
  })
})

describe("millasTotales", () => {
  it("suma las del viaje y las vacías", () => {
    expect(millasTotales(430.5, 189.5)).toBe(620)
  })

  it("sin millas vacías cuenta solo las del viaje", () => {
    expect(millasTotales(430.5)).toBe(430.5)
    expect(millasTotales(430.5, null)).toBe(430.5)
  })

  it("sin nada da cero, no NaN", () => {
    expect(millasTotales()).toBe(0)
  })
})
