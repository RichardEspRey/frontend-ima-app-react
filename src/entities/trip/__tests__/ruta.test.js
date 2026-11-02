import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"

import { esquemaRutaViaje, contarParadas, duracionLegible, TIPO_PARADA } from "../model/ruta"

const REAL = JSON.parse(readFileSync("src/entities/trip/__tests__/fixtures/getTripRoute.json", "utf8"))

describe("esquemaRutaViaje", () => {
  it("lee la respuesta real: resumen, trazo y altos", () => {
    const { ruta, unidad } = esquemaRutaViaje.parse(REAL)
    expect(unidad).toBe("6")
    expect(ruta.resumen.millas_total).toBe(477.85)
    expect(ruta.resumen.coords_inicial).toEqual({ lat: 27.4972383, lng: -99.6015149 })
    expect(ruta.track).toHaveLength(6)
    expect(ruta.track[0]).toEqual([27.49726, -99.60152])
    expect(ruta.paradas[0]).toMatchObject({ tipo: TIPO_PARADA.ESTACIONAMIENTO, minutos: 273 })
  })

  it("convierte lo que llega como texto y descarta puntos y altos ilegibles", () => {
    const { ruta } = esquemaRutaViaje.parse({
      ruta: {
        resumen: { km_total: "10.5", millas_total: "6.5", ubicacion_final: null },
        track: [["27.1", "-99.2"], [27.3], "basura", [27.4, -99.5]],
        paradas: [{ tipo: "otro", minutos: "5", lat: "27", lng: "-99" }, { tipo: "parada" }],
      },
    })
    expect(ruta.resumen.km_total).toBe(10.5)
    expect(ruta.resumen.ubicacion_final).toBe("")
    expect(ruta.track).toEqual([[27.1, -99.2], [27.4, -99.5]])
    expect(ruta.paradas).toEqual([
      { tipo: TIPO_PARADA.PARADA, llegada: "", salida: "", minutos: 5, lat: 27, lng: -99 },
    ])
  })

  it("sin ruta trae el motivo", () => {
    const sinRuta = esquemaRutaViaje.parse({ status: "success", ruta: null, message: "El viaje no tiene fechas." })
    expect(sinRuta.ruta).toBeNull()
    expect(sinRuta.message).toBe("El viaje no tiene fechas.")
  })
})

describe("contarParadas", () => {
  it("separa paradas de estacionamientos", () => {
    const { ruta } = esquemaRutaViaje.parse(REAL)
    expect(contarParadas(ruta.paradas)).toEqual({ paradas: 2, estacionamientos: 1 })
    expect(contarParadas()).toEqual({ paradas: 0, estacionamientos: 0 })
  })
})

describe("duracionLegible", () => {
  it("usa la unidad más grande que aplica", () => {
    expect(duracionLegible(18)).toBe("18 min")
    expect(duracionLegible(273)).toBe("4 h 33 min")
    expect(duracionLegible(1440 + 185)).toBe("1 d 3 h")
    expect(duracionLegible(undefined)).toBe("0 min")
  })
})
