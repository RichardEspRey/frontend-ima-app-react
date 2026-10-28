import { describe, expect, it } from "vitest"
import {
  ESTATUS_LADO,
  ESTATUS_PUNTO,
  UNIDAD,
  avisosDeInspecciones,
  contarPorAtender,
  esDescartada,
  esquemaPendiente,
  reparacionesVigentes,
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

describe("reparaciones descartadas", () => {
  const PENDIENTES = [
    { id: "1", estatus: ESTATUS_PUNTO.EN_PENDIENTES },
    { id: "2", estatus: ESTATUS_PUNTO.DESCARTADO },
    { id: "3", estatus: ESTATUS_PUNTO.EN_PENDIENTES },
  ]

  it("la descartada se reconoce por su estatus", () => {
    expect(esDescartada(PENDIENTES[1])).toBe(true)
    expect(esDescartada(PENDIENTES[0])).toBe(false)
  })

  it("solo las vigentes pueden entrar a una orden", () => {
    expect(reparacionesVigentes(PENDIENTES).map((p) => p.id)).toEqual(["1", "3"])
  })

  it("una pendiente sin estatus, como las de antes de descartar por id, cuenta como vigente", () => {
    const pendiente = esquemaPendiente.parse({ id: 9, descripcion: "Fuga de aire" })
    expect(pendiente.estatus).toBe(ESTATUS_PUNTO.EN_PENDIENTES)
    expect(esDescartada(pendiente)).toBe(false)
  })

  it("la levantada a mano no tiene viaje, y no dice «null»", () => {
    const pendiente = esquemaPendiente.parse({ id: 9, origen: "manual", trip_number: null, no_caja: "101" })
    expect(pendiente.trip_number).toBe("")
    expect(pendiente.no_caja).toBe("101")
  })

  it("conserva el operador y la fecha de enviado", () => {
    const pendiente = esquemaPendiente.parse({
      id: 9,
      driver_id: "42",
      operador: "Juan Pérez",
      fecha_reporte: "2026-10-21",
    })
    expect(pendiente.driver_id).toBe("42")
    expect(pendiente.operador).toBe("Juan Pérez")
    expect(pendiente.fecha_reporte).toBe("2026-10-21")
  })

  it("sin operador ni fecha no dice «null»", () => {
    const pendiente = esquemaPendiente.parse({ id: 9, driver_id: null, operador: null, fecha_reporte: null })
    expect(pendiente.driver_id).toBeNull()
    expect(pendiente.operador).toBe("")
    expect(pendiente.fecha_reporte).toBe("")
  })
})

describe("contarPorAtender", () => {
  it("cuenta las inspecciones que no se han cerrado", () => {
    expect(
      contarPorAtender([
        { estatus_lado: ESTATUS_LADO.PENDIENTE },
        { estatus_lado: ESTATUS_LADO.COMPLETADA },
        { estatus_lado: ESTATUS_LADO.PENDIENTE },
      ]),
    ).toBe(2)
  })

  it("sin datos todavía da cero", () => {
    expect(contarPorAtender(undefined)).toBe(0)
  })
})

describe("avisosDeInspecciones", () => {
  const ahora = new Date(2026, 9, 28, 12, 0)
  const fila = (extra) => ({
    cl_final_id: "264",
    viaje_id: "567",
    trip_number: "237",
    operador: "Juan Manuel Ruiz Torres",
    no_camion: "9",
    no_caja: "103",
    fecha_creacion: "2026-10-27 20:45:18",
    estatus_lado: ESTATUS_LADO.PENDIENTE,
    ...extra,
  })

  it("da un aviso por lado aunque camión y caja sean de la misma inspección", () => {
    const avisos = avisosDeInspecciones(
      { camion: [fila()], caja: [fila()] },
      new Map([["567", "237-US-84T2-26"]]),
      ahora,
    )

    expect(avisos.map((aviso) => aviso.id)).toEqual(["inspeccion-264-camion", "inspeccion-264-caja"])
    expect(avisos.map((aviso) => aviso.unidad)).toEqual(["9", "103"])
    expect(avisos[0]).toMatchObject({
      tipo: "inspeccion",
      clFinalId: "264",
      nomenclatura: "237-US-84T2-26",
      operador: "Juan Manuel Ruiz Torres",
    })
  })

  it("deja las abiertas aunque sean viejas y las cerradas solo si son recientes", () => {
    const avisos = avisosDeInspecciones(
      {
        camion: [
          fila({ cl_final_id: "1", fecha_creacion: "2026-01-08 08:49:46" }),
          fila({ cl_final_id: "2", fecha_creacion: "2026-01-08 08:49:46", estatus_lado: ESTATUS_LADO.COMPLETADA }),
          fila({ cl_final_id: "3", fecha_creacion: "2026-10-20 10:00:00", estatus_lado: ESTATUS_LADO.COMPLETADA }),
        ],
      },
      new Map(),
      ahora,
    )

    expect(avisos.map((aviso) => aviso.clFinalId)).toEqual(["1", "3"])
    expect(avisos[0].nomenclatura).toBe("237")
  })

  it("no falla mientras los lados no han llegado", () => {
    expect(avisosDeInspecciones({ camion: undefined, caja: undefined }, undefined, ahora)).toEqual([])
  })
})
