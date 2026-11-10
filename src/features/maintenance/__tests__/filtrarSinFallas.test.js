import { describe, expect, it } from "vitest"
import { SIN_FILTROS_SIN_FALLAS, filtrarSinFallas } from "../model/filtros"

const FILAS = [
  {
    cl_final_id: "274",
    nomenclatura: "255-US-26",
    trip_number: "255",
    operador: "Jose Luis Valdes Calderon",
    no_camion: "12",
    no_caja: "",
    fecha_creacion: "2026-11-06 14:38:27",
  },
  {
    cl_final_id: "260",
    nomenclatura: "236-US-83T2-26",
    trip_number: "236",
    operador: "Ruben Adolfo Alvarez Aldana",
    no_camion: "8",
    no_caja: "107",
    fecha_creacion: "2026-10-26 03:07:13",
  },
]

const con = (cambios) => ({ ...SIN_FILTROS_SIN_FALLAS, ...cambios })

describe("filtrarSinFallas", () => {
  it("sin filtros deja todas", () => {
    expect(filtrarSinFallas(FILAS, SIN_FILTROS_SIN_FALLAS)).toHaveLength(2)
  })

  it("busca el viaje en la nomenclatura completa", () => {
    expect(filtrarSinFallas(FILAS, con({ viaje: "83T2" })).map((f) => f.cl_final_id)).toEqual(["260"])
  })

  it("filtra camión y caja por separado y exactos", () => {
    expect(filtrarSinFallas(FILAS, con({ camion: "1" }))).toHaveLength(0)
    expect(filtrarSinFallas(FILAS, con({ camion: "12" })).map((f) => f.cl_final_id)).toEqual(["274"])
    expect(filtrarSinFallas(FILAS, con({ caja: "107" })).map((f) => f.cl_final_id)).toEqual(["260"])
  })

  it("respeta el rango de fechas por día", () => {
    expect(filtrarSinFallas(FILAS, con({ desde: "2026-11-06" })).map((f) => f.cl_final_id)).toEqual(["274"])
    expect(filtrarSinFallas(FILAS, con({ hasta: "2026-10-26" })).map((f) => f.cl_final_id)).toEqual(["260"])
  })

  it("busca al operador sin importar mayúsculas", () => {
    expect(filtrarSinFallas(FILAS, con({ operador: "ruben" })).map((f) => f.cl_final_id)).toEqual(["260"])
  })
})
