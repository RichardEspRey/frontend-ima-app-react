import { describe, it, expect } from "vitest"
import {
  PESTANAS_VIAJES,
  PESTANA_PROGRAMACION,
  pestanasPermitidas,
  pestanaDeReemplazo,
  DIRECCION_TODAS,
  filtrosActivos,
} from "../model/pestanas"

const TODOS_LOS_PERMISOS = Object.fromEntries(
  PESTANAS_VIAJES.map((pestana) => [pestana.permiso, true]),
)

describe("pestanasPermitidas", () => {
  it("con todos los permisos se ven las cinco", () => {
    expect(pestanasPermitidas(TODOS_LOS_PERMISOS)).toHaveLength(5)
  })

  it("sin permisos no se ve ninguna", () => {
    expect(pestanasPermitidas({})).toEqual([])
    expect(pestanasPermitidas(null)).toEqual([])
  })

  it("un permiso que no es exactamente true no cuenta", () => {
    expect(pestanasPermitidas({ viajes_tab_upcoming: "1" })).toEqual([])
    expect(pestanasPermitidas({ viajes_tab_upcoming: 1 })).toEqual([])
  })

  it("conserva el orden en que se muestran, no el de los ids", () => {
    const ids = pestanasPermitidas(TODOS_LOS_PERMISOS).map((p) => p.id)
    expect(ids[0]).toBe(PESTANA_PROGRAMACION)
    expect(ids).toEqual([4, 0, 1, 2, 3])
  })
})

describe("pestanaDeReemplazo", () => {
  it("si la pestaña actual sigue permitida, no se mueve", () => {
    const permitidas = pestanasPermitidas(TODOS_LOS_PERMISOS)
    expect(pestanaDeReemplazo(permitidas, 2)).toBeNull()
  })

  it("si le quitan el permiso a la que está mirando, cae en la primera que le queda", () => {
    const permitidas = pestanasPermitidas({ viajes_tab_en_ruta: true })
    expect(pestanaDeReemplazo(permitidas, 0)).toBe(2)
  })

  it("sin ninguna pestaña permitida no hay a dónde ir", () => {
    expect(pestanaDeReemplazo([], 0)).toBeNull()
  })
})

describe("filtrosActivos", () => {
  it("cuenta solo los que tienen algo escrito", () => {
    expect(filtrosActivos({ filterTrip: "70", filterDriver: "", filterTruck: null })).toBe(1)
  })

  it('"todas las direcciones" no cuenta como filtro', () => {
    expect(filtrosActivos({ filterDirection: DIRECCION_TODAS })).toBe(0)
    expect(filtrosActivos({ filterDirection: "Going Up" })).toBe(1)
  })

  it("sin filtros la cuenta es cero", () => {
    expect(filtrosActivos()).toBe(0)
    expect(filtrosActivos({})).toBe(0)
  })

  it("cuenta todos los filtros a la vez", () => {
    const todos = {
      filterTrip: "70",
      filterDriver: "Juan",
      filterTruck: "6",
      filterTrailer: "105",
      filterCompany: "4",
      filterOrigin: "Laredo",
      filterDestination: "Monterrey",
      filterCI: "INB1",
      filterDirection: "Going Down",
    }
    expect(filtrosActivos(todos)).toBe(9)
  })
})
