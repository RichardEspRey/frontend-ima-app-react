import { describe, it, expect } from "vitest"

import { esquemaRutaViaje, puntosDeRuta } from "../model/ruta"

const RESPUESTA = {
  status: "success",
  fecha_inicio: "2026-10-18 07:15:00",
  fecha_fin: "2026-10-21 17:40:00",
  unidad: 11,
  ruta: {
    millas_total: "512.4",
    km_total: "824.6",
    segmentos: [
      {
        inicio: "2026-10-18 07:20:00",
        fin: "2026-10-18 12:05:00",
        ubicacion_inicial: "Nuevo Laredo, TAM",
        ubicacion_final: "Laredo, TX",
        coords_inicial: { lat: "27.47", lng: "-99.51" },
        coords_final: { lat: 27.53, lng: -99.48 },
        km: "18.2",
      },
      {
        inicio: "2026-10-18 13:00:00",
        fin: "2026-10-18 19:30:00",
        ubicacion_inicial: "Laredo, TX",
        ubicacion_final: null,
        coords_inicial: { lat: 27.53, lng: -99.48 },
        coords_final: null,
        km: 400,
      },
    ],
  },
}

describe("esquemaRutaViaje", () => {
  it("convierte números y coordenadas que llegan como texto", () => {
    const { ruta, unidad } = esquemaRutaViaje.parse(RESPUESTA)
    expect(unidad).toBe("11")
    expect(ruta.km_total).toBe(824.6)
    expect(ruta.segmentos[0].coords_inicial).toEqual({ lat: 27.47, lng: -99.51 })
    expect(ruta.segmentos[1].ubicacion_final).toBe("")
    expect(ruta.segmentos[1].coords_final).toBeNull()
  })

  it("sin ruta trae el motivo", () => {
    const sinRuta = esquemaRutaViaje.parse({ status: "success", ruta: null, message: "El viaje no tiene fechas." })
    expect(sinRuta.ruta).toBeNull()
    expect(sinRuta.message).toBe("El viaje no tiene fechas.")
  })
})

describe("puntosDeRuta", () => {
  it("traza el inicio y el final de cada tramo y se salta los que faltan", () => {
    const { ruta } = esquemaRutaViaje.parse(RESPUESTA)
    expect(puntosDeRuta(ruta.segmentos)).toEqual([
      [27.47, -99.51],
      [27.53, -99.48],
      [27.53, -99.48],
    ])
  })

  it("sin tramos no hay puntos", () => {
    expect(puntosDeRuta()).toEqual([])
  })
})
