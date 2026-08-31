import { describe, it, expect } from "vitest"
import {
  ESTADO_PERIODO,
  esquemaPeriodo,
  esquemaDetallePago,
  normalizarLista,
  estaPendiente,
  plantillaTotal,
  etiquetaPeriodo,
} from "../model/nomina"

const SEMANA_API = {
  period_id: "12",
  semana: "35",
  anio: "2026",
  fecha_corte: "2026-08-31 00:00:00",
  emps_mx: "8",
  total_mx: "42500.00",
  emps_us: "4",
  total_us: "6200.50",
  estado: "Pendiente",
}

describe("esquemaPeriodo", () => {
  it("convierte los números que PHP manda como cadena", () => {
    const p = esquemaPeriodo.parse(SEMANA_API)
    expect(p.total_mx).toBe(42500)
    expect(p.emps_mx).toBe(8)
    expect(p.semana).toBe(35)
  })

  it("recorta la hora de la fecha de corte", () => {
    expect(esquemaPeriodo.parse(SEMANA_API).fecha_corte).toBe("2026-08-31")
  })

  it("una fecha de corte nula no revienta: era el bug del split", () => {
    const p = esquemaPeriodo.parse({ ...SEMANA_API, fecha_corte: null })
    expect(p.fecha_corte).toBe("")
  })

  it("un total ausente cae a 0 en vez de NaN", () => {
    const p = esquemaPeriodo.parse({ ...SEMANA_API, total_us: undefined })
    expect(p.total_us).toBe(0)
    expect(Number.isNaN(p.total_us)).toBe(false)
  })

  it("un total con basura cae a 0, no a NaN", () => {
    expect(esquemaPeriodo.parse({ ...SEMANA_API, total_mx: "n/a" }).total_mx).toBe(0)
  })
})

describe("esquemaDetallePago", () => {
  it("normaliza el tipo de nómina a MX o US", () => {
    expect(esquemaDetallePago.parse({ nombre: "Ana", tipo_nomina: "MX", sueldo: "1" }).tipo_nomina).toBe("MX")
    expect(esquemaDetallePago.parse({ nombre: "Ana", tipo_nomina: "US", sueldo: "1" }).tipo_nomina).toBe("US")
  })

  it("cualquier otro valor cuenta como dólares, igual que hace la app", () => {
    expect(esquemaDetallePago.parse({ nombre: "Ana", tipo_nomina: "USA", sueldo: "1" }).tipo_nomina).toBe("US")
  })

  it("exige nombre: sin él la fila no se puede ni pintar", () => {
    expect(esquemaDetallePago.safeParse({ puesto: "Velador", sueldo: "1" }).success).toBe(false)
  })

  it("tolera puesto y frecuencia vacíos", () => {
    const d = esquemaDetallePago.parse({ nombre: "Ana", sueldo: "500" })
    expect(d.puesto).toBe("")
    expect(d.frecuencia_pago).toBe("")
  })
})

describe("normalizarLista", () => {
  it("descarta las filas malas y cuenta cuántas", () => {
    const { validos, descartados } = normalizarLista(
      [{ nombre: "Ana", sueldo: "1" }, { puesto: "sin nombre" }, { nombre: "Beto", sueldo: "2" }],
      esquemaDetallePago,
    )
    expect(validos).toHaveLength(2)
    expect(descartados).toBe(1)
  })

  it("una fila mala no tumba la lista entera", () => {
    const { validos } = normalizarLista([null, { nombre: "Ana", sueldo: "1" }], esquemaDetallePago)
    expect(validos).toHaveLength(1)
  })

  it("una lista vacía da una lista vacía, no undefined", () => {
    expect(normalizarLista([], esquemaPeriodo)).toEqual({ validos: [], descartados: 0 })
  })
})

describe("reglas del periodo", () => {
  it("estaPendiente distingue los dos estados", () => {
    expect(estaPendiente({ estado: ESTADO_PERIODO.PENDIENTE })).toBe(true)
    expect(estaPendiente({ estado: ESTADO_PERIODO.AUTORIZADO })).toBe(false)
  })

  it("estaPendiente tolera un periodo ausente", () => {
    expect(estaPendiente(undefined)).toBe(false)
  })

  it("plantillaTotal suma las dos nóminas", () => {
    expect(plantillaTotal({ emps_mx: 8, emps_us: 4 })).toBe(12)
  })

  it("plantillaTotal no devuelve NaN con campos ausentes", () => {
    expect(plantillaTotal({})).toBe(0)
    expect(plantillaTotal(undefined)).toBe(0)
  })

  it("etiquetaPeriodo arma el encabezado", () => {
    expect(etiquetaPeriodo({ semana: 35, anio: 2026 })).toBe("Semana 35 (2026)")
  })

  it("etiquetaPeriodo no imprime undefined cuando falta el dato", () => {
    expect(etiquetaPeriodo(undefined)).toBe("Semana — (—)")
  })
})
