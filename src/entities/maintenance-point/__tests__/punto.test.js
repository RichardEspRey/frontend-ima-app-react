import { describe, expect, it } from "vitest"
import {
  ESTATUS_PUNTO,
  UNIDAD,
  agruparPorRubro,
  agruparPorUnidad,
  clavePunto,
  esPuntoSinFalla,
  estaResuelto,
  rubrosDeLado,
} from "../model/punto"

describe("esPuntoSinFalla", () => {
  it("reconoce lo que el operador escribe cuando no hay nada que hacer", () => {
    for (const texto of ["ok", "OK", "Ok.", " bien ", "buen estado", "sin novedad", "N/A", ""]) {
      expect(esPuntoSinFalla(texto)).toBe(true)
    }
  })

  it("no esconde una falla de verdad", () => {
    expect(esPuntoSinFalla("Fuga de aceite")).toBe(false)
    expect(esPuntoSinFalla("Buen estado, ajustar flechas por fuga de aceite")).toBe(false)
  })

  it("aguanta nulos sin reventar", () => {
    expect(esPuntoSinFalla(null)).toBe(true)
    expect(esPuntoSinFalla(undefined)).toBe(true)
  })
})

describe("estaResuelto", () => {
  it("un punto recién llegado no está resuelto", () => {
    expect(estaResuelto({ estatus: ESTATUS_PUNTO.SIN_RESOLVER })).toBe(false)
  })

  it("los otros tres estados sí cuentan como resueltos", () => {
    expect(estaResuelto({ estatus: ESTATUS_PUNTO.EN_PENDIENTES })).toBe(true)
    expect(estaResuelto({ estatus: ESTATUS_PUNTO.CON_ORDEN })).toBe(true)
    expect(estaResuelto({ estatus: ESTATUS_PUNTO.DESCARTADO })).toBe(true)
  })
})

describe("rubrosDeLado", () => {
  it("el remolque es de la caja y no del tractor", () => {
    expect(rubrosDeLado(UNIDAD.CAJA).map((r) => r.clave)).toEqual(["remolque"])
    expect(rubrosDeLado(UNIDAD.CAMION).map((r) => r.clave)).not.toContain("remolque")
  })
})

describe("agruparPorRubro", () => {
  it("respeta el orden del checklist y omite los rubros vacíos", () => {
    const puntos = [
      { rubro: "otro", texto: "Humedad" },
      { rubro: "motor", texto: "Consumo de aceite" },
    ]

    expect(agruparPorRubro(puntos).map((r) => r.clave)).toEqual(["motor", "otro"])
  })
})

describe("agruparPorUnidad", () => {
  const pendientes = [
    { id: "1", truck_id: "4", no_camion: "4", descripcion: "Aceite" },
    { id: "2", truck_id: "10", no_camion: "10", descripcion: "Llanta" },
    { id: "3", truck_id: "4", no_camion: "4", descripcion: "Frenos" },
  ]

  it("junta las reparaciones de una misma unidad", () => {
    const unidades = agruparPorUnidad(pendientes, UNIDAD.CAMION)

    expect(unidades).toHaveLength(2)
    expect(unidades.find((u) => u.etiqueta === "4").reparaciones).toHaveLength(2)
  })

  it("ordena las unidades por número y no como texto", () => {
    expect(agruparPorUnidad(pendientes, UNIDAD.CAMION).map((u) => u.etiqueta)).toEqual(["4", "10"])
  })

  it("del lado de la caja agrupa por caja", () => {
    const cajas = [{ id: "9", caja_id: "8", no_caja: "102", descripcion: "Luces" }]

    expect(agruparPorUnidad(cajas, UNIDAD.CAJA)[0].etiqueta).toBe("102")
  })
})

describe("clavePunto", () => {
  it("identifica el renglón por su tabla y su id de origen", () => {
    expect(clavePunto({ origen_tabla: "cl_motor", origen_id: 87 })).toBe("cl_motor-87")
  })
})
