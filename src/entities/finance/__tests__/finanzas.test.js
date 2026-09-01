import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  ESTADO_COBRO,
  ESTADO_PAGO_CONDUCTOR,
  esquemaViajeFinanzas,
  esquemaPagoConductor,
  esquemaTarifaConductor,
  normalizarEstadoCobro,
  etiquetaCobro,
  estaPagado,
  saldoPendiente,
  totalesFinanzas,
  estaAutorizado,
  estaPagadoConductor,
  normalizarLista,
} from "../model/finanzas"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/finance/__tests__/fixtures/${nombre}.json`, "utf8"))

const VIAJES = leer("All_finanzas")
const PAGOS = leer("All_paymentDrivers")
const TARIFAS = leer("get_millasDriver")

describe("normalizarEstadoCobro", () => {
  it("trata el nulo como pendiente de cobrar", () => {
    expect(normalizarEstadoCobro(null)).toBe(ESTADO_COBRO.PENDIENTE_COBRAR)
    expect(normalizarEstadoCobro(undefined)).toBe(ESTADO_COBRO.PENDIENTE_COBRAR)
  })

  it("acepta el estado como número o como cadena", () => {
    expect(normalizarEstadoCobro("3")).toBe(ESTADO_COBRO.PAGADA)
    expect(normalizarEstadoCobro(3)).toBe(ESTADO_COBRO.PAGADA)
  })
})

describe("etiquetaCobro", () => {
  it("da texto y color de cada estado", () => {
    expect(etiquetaCobro({ status_trip: 3 }).label).toBe("Pagada")
    expect(etiquetaCobro({ status_trip: 0 }).label).toBe("Pendiente de cobrar")
  })

  it("un viaje sin estado se muestra como pendiente, no en blanco", () => {
    expect(etiquetaCobro({ status_trip: null }).label).toBe("Pendiente de cobrar")
    expect(etiquetaCobro({}).label).toBe("Pendiente de cobrar")
  })

  it("un estado desconocido no deja la celda vacía", () => {
    expect(etiquetaCobro({ status_trip: 99 }).label).toBeTruthy()
  })
})

describe("estaPagado y saldoPendiente", () => {
  it("solo el estado 3 cuenta como pagado", () => {
    expect(estaPagado({ status_trip: 3 })).toBe(true)
    expect(estaPagado({ status_trip: 2 })).toBe(false)
    expect(estaPagado({ status_trip: null })).toBe(false)
  })

  it("el saldo es lo que falta por cobrar", () => {
    expect(saldoPendiente({ total_tarifa: 1000, total_pagada: 400 })).toBe(600)
  })

  it("cobrar de más no da saldo negativo", () => {
    expect(saldoPendiente({ total_tarifa: 100, total_pagada: 150 })).toBe(0)
  })

  it("sin datos da 0, no NaN", () => {
    expect(saldoPendiente({})).toBe(0)
    expect(saldoPendiente(undefined)).toBe(0)
  })
})

describe("totalesFinanzas", () => {
  it("suma tarifa, cobrado y pendiente", () => {
    const t = totalesFinanzas([
      { total_tarifa: 1000, total_pagada: 400 },
      { total_tarifa: 500, total_pagada: 500 },
    ])
    expect(t).toEqual({ tarifa: 1500, pagada: 900, pendiente: 600 })
  })

  it("sin viajes da ceros", () => {
    expect(totalesFinanzas([])).toEqual({ tarifa: 0, pagada: 0, pendiente: 0 })
  })
})

describe("estados de pago al conductor", () => {
  it("distingue autorizado de pagado", () => {
    expect(estaAutorizado({ status_payment: "2" })).toBe(true)
    expect(estaPagadoConductor({ status_payment: "1" })).toBe(true)
    expect(estaAutorizado({ status_payment: "1" })).toBe(false)
  })

  it("compara como cadena, venga como número o texto", () => {
    expect(estaPagadoConductor({ status_payment: 1 })).toBe(true)
  })
})

describe("contra la respuesta real de la API", () => {
  it("normaliza los viajes sin descartar ninguno", () => {
    const { validos, descartados } = normalizarLista(VIAJES.data, esquemaViajeFinanzas)
    expect(validos).toHaveLength(VIAJES.data.length)
    expect(descartados).toBe(0)
  })

  it("las etapas vienen anidadas dentro del viaje", () => {
    const { validos } = normalizarLista(VIAJES.data, esquemaViajeFinanzas)
    expect(validos.some((v) => v.stages.length > 0)).toBe(true)
  })

  it("todo viaje real recibe una etiqueta de cobro, incluidos los de estado nulo", () => {
    const { validos } = normalizarLista(VIAJES.data, esquemaViajeFinanzas)
    for (const v of validos) expect(etiquetaCobro(v).label).toBeTruthy()
  })

  it("ningún viaje real produce NaN en su saldo", () => {
    const { validos } = normalizarLista(VIAJES.data, esquemaViajeFinanzas)
    for (const v of validos) expect(Number.isNaN(saldoPendiente(v))).toBe(false)
  })

  it("normaliza los pagos a conductores sin descartar ninguno", () => {
    const { validos, descartados } = normalizarLista(PAGOS.data, esquemaPagoConductor)
    expect(validos).toHaveLength(PAGOS.data.length)
    expect(descartados).toBe(0)
  })

  it("los estados de pago reales caen en los tres conocidos", () => {
    const { validos } = normalizarLista(PAGOS.data, esquemaPagoConductor)
    const conocidos = Object.values(ESTADO_PAGO_CONDUCTOR)
    for (const p of validos) expect(conocidos).toContain(p.status_payment)
  })

  it("las tarifas por milla quedan como número", () => {
    const { validos } = normalizarLista(TARIFAS.data, esquemaTarifaConductor)
    expect(validos.length).toBeGreaterThan(0)
    for (const t of validos) {
      expect(typeof t.valor_milla).toBe("number")
      expect(typeof t.activo).toBe("boolean")
    }
  })
})
