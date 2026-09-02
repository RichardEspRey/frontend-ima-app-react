import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  ESTADO_VIAJE,
  colorEstadoViaje,
  etiquetaTipoEtapa,
} from "../model/viaje"
import {
  totalesViaje,
  utilidadCuadra,
  utilidadNeta,
  etapasDeResumen,
  dieselDeResumen,
  gastosDeResumen,
  galonesDeResumen,
} from "../model/resumen"
import { COLOR } from "../../../shared/ui/tokens"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/trip/__tests__/fixtures/${nombre}`, "utf8"))

const VIAJE_480 = leer("trip_summary_480.json").data
const VIAJE_502 = leer("trip_summary_502.json").data
const NO_ENCONTRADO = leer("trip_summary_no_encontrado.json")

describe("colorEstadoViaje", () => {
  it("da su color a cada estado del ciclo", () => {
    expect(colorEstadoViaje(ESTADO_VIAJE.COMPLETADO)).toBe(COLOR.EXITO)
    expect(colorEstadoViaje(ESTADO_VIAJE.CANCELADO)).toBe(COLOR.PELIGRO)
  })

  it("sin estado asume que va en tránsito", () => {
    expect(colorEstadoViaje(null)).toBe(colorEstadoViaje(ESTADO_VIAJE.EN_TRANSITO))
    expect(colorEstadoViaje("")).toBe(colorEstadoViaje(ESTADO_VIAJE.EN_TRANSITO))
  })

  it("un estado desconocido no se queda sin color", () => {
    expect(colorEstadoViaje("Inventado")).toBe("#64748b")
  })
})

describe("etiquetaTipoEtapa", () => {
  it("traduce los tres tipos de etapa", () => {
    expect(etiquetaTipoEtapa("borderCrossing")).toBe("Cruce")
    expect(etiquetaTipoEtapa("normalTrip")).toBe("Normal")
    expect(etiquetaTipoEtapa("emptyMileage")).toBe("Etapa de Millaje Vacío")
  })

  it("no depende de cómo esté escrito en la base", () => {
    expect(etiquetaTipoEtapa("bordercrossing")).toBe("Cruce")
    expect(etiquetaTipoEtapa("NORMALTRIP")).toBe("Normal")
  })

  it("sin tipo no deja el hueco vacío", () => {
    expect(etiquetaTipoEtapa(null)).toBe("—")
    expect(etiquetaTipoEtapa("")).toBe("—")
  })

  it("los tipos reales de las etapas de producción se traducen todos", () => {
    for (const etapa of etapasDeResumen(VIAJE_480)) {
      expect(etiquetaTipoEtapa(etapa.stageType)).not.toBe(etapa.stageType)
    }
  })
})

describe("totalesViaje, contra el viaje 480 de producción", () => {
  it("toma el pago al conductor de donde el backend lo publica", () => {
    const totales = totalesViaje(VIAJE_480)
    expect(totales.pagoConductor).toBe(1122.26)
  })

  it("la clave que leía la pantalla no existe en la respuesta", () => {
    expect(VIAJE_480).not.toHaveProperty("driver_payments")
    expect(VIAJE_502).not.toHaveProperty("driver_payments")
  })

  it("la utilidad del backend no descuenta el pago al conductor", () => {
    const totales = totalesViaje(VIAJE_480)
    expect(totales.utilidad).toBe(4503)
    expect(totales.tarifa - totales.diesel - totales.gastos).toBe(4503)
  })

  it("la utilidad neta sí lo descuenta, y difiere en los 1 122.26 del conductor", () => {
    const totales = totalesViaje(VIAJE_480)
    expect(utilidadNeta(totales)).toBeCloseTo(3380.74, 2)
    expect(totales.utilidad - utilidadNeta(totales)).toBeCloseTo(1122.26, 2)
  })

  it("los totales cuadran con la definición del backend", () => {
    expect(utilidadCuadra(totalesViaje(VIAJE_480))).toBe(true)
    expect(utilidadCuadra(totalesViaje(VIAJE_502))).toBe(true)
  })

  it("un viaje sin facturar da números en cero, no NaN", () => {
    const totales = totalesViaje(VIAJE_502)
    expect(totales.tarifa).toBe(0)
    expect(totales.diesel).toBe(400)
    expect(totales.utilidad).toBe(-400)
    expect(Object.values(totales).every(Number.isFinite)).toBe(true)
  })

  it("sin resumen devuelve ceros en vez de reventar", () => {
    const totales = totalesViaje(undefined)
    expect(Object.values(totales)).toEqual([0, 0, 0, 0, 0])
  })

  it("un total nulo o de texto se convierte a número", () => {
    const totales = totalesViaje({ totales: { rate: "6200", driver_pay: null } })
    expect(totales.tarifa).toBe(6200)
    expect(totales.pagoConductor).toBe(0)
  })
})

describe("utilidadCuadra", () => {
  it("avisa cuando el resumen se contradice", () => {
    const inventado = { tarifa: 100, diesel: 10, gastos: 10, pagoConductor: 10, utilidad: 999 }
    expect(utilidadCuadra(inventado)).toBe(false)
  })

  it("tolera un peso de diferencia por redondeos", () => {
    const casi = { tarifa: 100, diesel: 10, gastos: 10, pagoConductor: 10, utilidad: 80.4 }
    expect(utilidadCuadra(casi)).toBe(true)
  })

  it("el pago al conductor no entra en la comprobación", () => {
    const conPago = { tarifa: 100, diesel: 10, gastos: 10, pagoConductor: 50, utilidad: 80 }
    expect(utilidadCuadra(conPago)).toBe(true)
  })
})

describe("listas del resumen", () => {
  it("saca etapas, diesel y gastos del viaje 480", () => {
    expect(etapasDeResumen(VIAJE_480)).toHaveLength(3)
    expect(dieselDeResumen(VIAJE_480)).toHaveLength(3)
    expect(gastosDeResumen(VIAJE_480)).toHaveLength(1)
  })

  it("un viaje sin gastos devuelve lista vacía, no undefined", () => {
    expect(gastosDeResumen(VIAJE_502)).toEqual([])
  })

  it("sin resumen todas las listas son vacías", () => {
    expect(etapasDeResumen()).toEqual([])
    expect(dieselDeResumen(null)).toEqual([])
    expect(gastosDeResumen({})).toEqual([])
  })

  it("los galones vienen como número", () => {
    expect(typeof galonesDeResumen(VIAJE_480)).toBe("number")
    expect(galonesDeResumen({})).toBe(0)
  })
})

describe("la respuesta de un viaje inexistente", () => {
  it("no es un error de los que el cliente convierte en excepción", () => {
    expect(NO_ENCONTRADO.status).toBe("not found")
    expect(NO_ENCONTRADO.status).not.toBe("error")
    expect(NO_ENCONTRADO).not.toHaveProperty("data")
  })
})
