import { describe, it, expect } from "vitest"
import { ESTADO_DOCUMENTO } from "../../unit"
import {
  OBSERVACION_CAJA,
  UBICACION_CAJA,
  contarPorObservacion,
  estadoFianza,
  normalizarEstatusCajas,
} from "../model/estatusCaja"

const HOY = new Date("2026-09-21T18:00:00")

const CAJA_API = {
  caja_id: 7,
  no_caja: "101",
  operador: "Alejandro Zablah Ruiz",
  trip_id: 509,
  trip_number: "205",
  ubicacion: "RUTA SUBIENDO",
  observacion: "CARGADA",
  ubicacion_auto: "RUTA SUBIENDO",
  observacion_auto: "CARGADA",
  manual: false,
  broker: "GEBESA",
  fianza: { fecha_vencimiento: "2026-10-02", url_pdf: "Uploads/Cajas/Fianza_7.pdf" },
}

describe("normalizarEstatusCajas", () => {
  it("acepta la fila tal como la manda el endpoint", () => {
    const { cajas, descartados } = normalizarEstatusCajas([CAJA_API])

    expect(descartados).toBe(0)
    expect(cajas[0].caja_id).toBe(7)
    expect(cajas[0].no_caja).toBe("101")
    expect(cajas[0].broker).toBe("GEBESA")
  })

  it("una caja sin viaje trae los campos del viaje en null", () => {
    const sinViaje = { ...CAJA_API, trip_id: null, trip_number: null, operador: null, broker: null }
    const { cajas } = normalizarEstatusCajas([sinViaje])

    expect(cajas[0].trip_id).toBeNull()
    expect(cajas[0].operador).toBeNull()
  })

  it("descarta la fila sin identificador en vez de tumbar la pantalla", () => {
    const { cajas, descartados } = normalizarEstatusCajas([CAJA_API, { no_caja: "999" }])

    expect(cajas).toHaveLength(1)
    expect(descartados).toBe(1)
  })

  it("sin lista devuelve vacío", () => {
    expect(normalizarEstatusCajas(undefined).cajas).toEqual([])
  })
})

describe("estadoFianza", () => {
  it("una fianza con fecha lejana está vigente", () => {
    expect(estadoFianza({ fecha_vencimiento: "2026-12-31", url_pdf: "x.pdf" }, HOY).estado).toBe(
      ESTADO_DOCUMENTO.VIGENTE,
    )
  })

  it("dentro de los 30 días avisa antes de que venza", () => {
    expect(estadoFianza({ fecha_vencimiento: "2026-10-02", url_pdf: "x.pdf" }, HOY).estado).toBe(
      ESTADO_DOCUMENTO.POR_VENCER,
    )
  })

  it("una fecha pasada está vencida", () => {
    expect(estadoFianza({ fecha_vencimiento: "2026-09-12", url_pdf: "x.pdf" }, HOY).estado).toBe(
      ESTADO_DOCUMENTO.VENCIDO,
    )
  })

  it("una caja sin fianza no está vencida, le falta", () => {
    expect(estadoFianza(null, HOY).estado).toBe(ESTADO_DOCUMENTO.FALTANTE)
  })
})

describe("contarPorObservacion", () => {
  it("separa cargadas de vacías", () => {
    const cajas = [
      { observacion: OBSERVACION_CAJA.CARGADA },
      { observacion: OBSERVACION_CAJA.CARGADA },
      { observacion: OBSERVACION_CAJA.VACIA },
    ]

    expect(contarPorObservacion(cajas)).toEqual({ cargadas: 2, vacias: 1 })
  })

  it("sin cajas no cuenta nada", () => {
    expect(contarPorObservacion(undefined)).toEqual({ cargadas: 0, vacias: 0 })
  })
})

describe("las listas cerradas", () => {
  it("la ubicación solo admite los cuatro lugares acordados", () => {
    expect(Object.values(UBICACION_CAJA)).toEqual([
      "PENSION NLD",
      "TALLER",
      "RUTA SUBIENDO",
      "RUTA BAJANDO",
    ])
  })
})
