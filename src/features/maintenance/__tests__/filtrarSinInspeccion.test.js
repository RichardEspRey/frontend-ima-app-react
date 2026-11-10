import { describe, expect, it } from "vitest"
import { SIN_FILTROS_SIN_INSPECCION, filtrarSinInspeccion } from "../model/filtros"

const VIAJES = [
  {
    viaje_id: "584",
    nomenclatura: "101-MX-91T1-26",
    trip_number: "101",
    operador: "Cesar Fierro Santamaría",
    operador_2: "",
    no_camion: "6",
    creation_date: "2026-10-27 08:00:00",
  },
  {
    viaje_id: "578",
    nomenclatura: "243-US-88T2-26",
    trip_number: "243",
    operador: "Alejandro Zablah Ruiz",
    operador_2: "Jonathan Valentin Avila Velazquez",
    no_camion: "4",
    creation_date: "2026-10-22 08:00:00",
  },
]

const con = (cambios) => ({ ...SIN_FILTROS_SIN_INSPECCION, ...cambios })
const ids = (viajes) => viajes.map((viaje) => viaje.viaje_id)

describe("filtrarSinInspeccion", () => {
  it("sin filtros deja todos", () => {
    expect(filtrarSinInspeccion(VIAJES, SIN_FILTROS_SIN_INSPECCION)).toHaveLength(2)
  })

  it("busca al operador en los dos choferes del viaje", () => {
    expect(ids(filtrarSinInspeccion(VIAJES, con({ operador: "jonathan" })))).toEqual(["578"])
  })

  it("busca el viaje en la nomenclatura", () => {
    expect(ids(filtrarSinInspeccion(VIAJES, con({ viaje: "MX-91" })))).toEqual(["584"])
  })

  it("filtra camión exacto y por día de creación", () => {
    expect(ids(filtrarSinInspeccion(VIAJES, con({ camion: "6" })))).toEqual(["584"])
    expect(ids(filtrarSinInspeccion(VIAJES, con({ hasta: "2026-10-22" })))).toEqual(["578"])
  })
})
