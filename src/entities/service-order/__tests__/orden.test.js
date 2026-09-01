import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  ESTATUS_ORDEN,
  esquemaOrden,
  normalizarOrdenes,
  estaAbierta,
  resumenServicios,
  todoCompletado,
} from "../model/orden"

const REAL = JSON.parse(
  readFileSync("src/entities/service-order/__tests__/fixtures/getAllOrdersWithDetails.json", "utf8"),
)

const ORDEN_API = {
  id_orden: "353",
  fecha_orden: "2026-06-22",
  estatus: "Abierta",
  truck_id: "12",
  tipo_cambio: null,
  nombre_camion: "11",
  servicios: [],
}

describe("esquemaOrden", () => {
  it("convierte los ids que PHP manda como número o cadena", () => {
    const o = esquemaOrden.parse(ORDEN_API)
    expect(o.id_orden).toBe("353")
    expect(o.truck_id).toBe("12")
  })

  it("tolera tipo_cambio nulo: son las órdenes en pesos", () => {
    expect(esquemaOrden.parse(ORDEN_API).tipo_cambio).toBeNull()
  })

  it("recorta la hora de la fecha de orden", () => {
    expect(esquemaOrden.parse({ ...ORDEN_API, fecha_orden: "2026-06-22 09:00:00" }).fecha_orden)
      .toBe("2026-06-22")
  })

  it("una orden sin servicios da lista vacía, no undefined", () => {
    const { servicios } = esquemaOrden.parse({ ...ORDEN_API, servicios: undefined })
    expect(servicios).toEqual([])
  })
})

describe("resumenServicios", () => {
  const con = (...estatus) => ({ servicios: estatus.map((e) => ({ estatus: e })) })

  it("cuenta completados y pendientes", () => {
    const r = resumenServicios(con("Completado", "Abierta", "Pendiente"))
    expect(r).toEqual({ total: 3, completados: 1, pendientes: 2 })
  })

  it("una orden sin servicios da ceros, no NaN", () => {
    expect(resumenServicios({})).toEqual({ total: 0, completados: 0, pendientes: 0 })
    expect(resumenServicios(undefined)).toEqual({ total: 0, completados: 0, pendientes: 0 })
  })
})

describe("todoCompletado", () => {
  it("es cierto solo si hay servicios y todos están completos", () => {
    expect(todoCompletado({ servicios: [{ estatus: "Completado" }] })).toBe(true)
    expect(todoCompletado({ servicios: [{ estatus: "Completado" }, { estatus: "Abierta" }] })).toBe(false)
  })

  it("una orden SIN servicios no cuenta como completada", () => {
    expect(todoCompletado({ servicios: [] })).toBe(false)
  })
})

describe("estaAbierta", () => {
  it("solo las completadas dejan de estar abiertas", () => {
    expect(estaAbierta({ estatus: ESTATUS_ORDEN.ABIERTA })).toBe(true)
    expect(estaAbierta({ estatus: ESTATUS_ORDEN.PENDIENTE })).toBe(true)
    expect(estaAbierta({ estatus: ESTATUS_ORDEN.COMPLETADO })).toBe(false)
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza todas las órdenes sin descartar ninguna", () => {
    const { ordenes, descartados } = normalizarOrdenes(REAL.data)
    expect(ordenes).toHaveLength(REAL.data.length)
    expect(descartados).toBe(0)
  })

  it("los servicios vienen anidados dentro de cada orden", () => {
    const { ordenes } = normalizarOrdenes(REAL.data)
    expect(ordenes.some((o) => o.servicios.length > 0)).toBe(true)
  })

  it("todos los estatus caen en los tres valores conocidos", () => {
    const { ordenes } = normalizarOrdenes(REAL.data)
    const validos = Object.values(ESTATUS_ORDEN)
    for (const orden of ordenes) {
      expect(validos).toContain(orden.estatus)
      for (const servicio of orden.servicios) expect(validos).toContain(servicio.estatus)
    }
  })

  it("ninguna orden real produce NaN en su resumen", () => {
    const { ordenes } = normalizarOrdenes(REAL.data)
    for (const orden of ordenes) {
      const r = resumenServicios(orden)
      expect(Number.isNaN(r.total)).toBe(false)
      expect(r.completados + r.pendientes).toBe(r.total)
    }
  })
})
