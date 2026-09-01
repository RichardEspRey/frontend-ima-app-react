import { describe, it, expect } from "vitest"
import {
  puntoDesdeMapa,
  puntoDesdeBusqueda,
  puntoDesdeUnidad,
  coordenadasDeRuta,
  resumenRuta,
} from "../model/ruta"

describe("puntoDesdeMapa", () => {
  it("nombra el punto con sus coordenadas", () => {
    const punto = puntoDesdeMapa({ lat: 27.393891, lng: -99.550355 })
    expect(punto).toEqual({ lat: 27.393891, lon: -99.550355, name: "27.39389, -99.55035" })
  })
})

describe("puntoDesdeBusqueda", () => {
  it("convierte las coordenadas de texto a número", () => {
    const punto = puntoDesdeBusqueda({ lat: "27.39", lon: "-99.55", display_name: "Laredo" })
    expect(punto.lat).toBe(27.39)
    expect(punto.lon).toBe(-99.55)
  })

  it("recorta las direcciones que no caben en el panel", () => {
    const largo = "Calle ".repeat(30)
    const punto = puntoDesdeBusqueda({ lat: "1", lon: "2", display_name: largo })
    expect(punto.name.length).toBe(71)
    expect(punto.name.endsWith("…")).toBe(true)
  })

  it("una dirección corta se deja tal cual", () => {
    expect(puntoDesdeBusqueda({ lat: "1", lon: "2", display_name: "Laredo" }).name).toBe("Laredo")
  })
})

describe("puntoDesdeUnidad", () => {
  it("conserva el id para reconocer el camión después", () => {
    const punto = puntoDesdeUnidad({ id: 402161382, lat: 27.39, lon: -99.55, name: "IMA 01" })
    expect(punto).toEqual({ id: 402161382, lat: 27.39, lon: -99.55, name: "IMA 01" })
  })
})

describe("coordenadasDeRuta", () => {
  it("voltea longitud y latitud, que es como las quiere el mapa", () => {
    const coords = coordenadasDeRuta({ geometry: { coordinates: [[-99.55, 27.39], [-100.31, 25.68]] } })
    expect(coords).toEqual([[27.39, -99.55], [25.68, -100.31]])
  })

  it("una ruta sin trazo devuelve lista vacía", () => {
    expect(coordenadasDeRuta({})).toEqual([])
    expect(coordenadasDeRuta()).toEqual([])
  })
})

describe("resumenRuta", () => {
  it("pasa metros y segundos a kilómetros y minutos", () => {
    expect(resumenRuta({ distance: 254300, duration: 10800 })).toEqual({
      distancia: "254.3",
      duracion: 180,
    })
  })

  it("una ruta vacía da ceros, no NaN", () => {
    expect(resumenRuta({})).toEqual({ distancia: "0.0", duracion: 0 })
  })
})
