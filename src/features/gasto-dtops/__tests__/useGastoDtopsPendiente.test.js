import { describe, it, expect } from "vitest"
import { act, renderHook } from "@testing-library/react"

import { useGastoDtopsPendiente } from "../model/useGastoDtopsPendiente"

const archivo = new File(["x"], "dtops.pdf", { type: "application/pdf" })

const subidaDtops = {
  tipoDocumento: "DTOPS",
  indiceParada: null,
  archivo,
  pais: "US",
  viaje: "212",
  anterior: null,
}

describe("useGastoDtopsPendiente", () => {
  it("empieza sin gasto pendiente", () => {
    const { result } = renderHook(() => useGastoDtopsPendiente())
    expect(result.current.pendiente).toBeNull()
  })

  it("deja pendiente el gasto al subir el DTOPS de una etapa", () => {
    const { result } = renderHook(() => useGastoDtopsPendiente())
    act(() => result.current.alSubirDocumento(subidaDtops))
    expect(result.current.pendiente).toEqual({ archivo, viaje: "212", yaExistia: false })
  })

  it("avisa que ya había un DTOPS guardado en la etapa", () => {
    const { result } = renderHook(() => useGastoDtopsPendiente())
    act(() => result.current.alSubirDocumento({ ...subidaDtops, anterior: { document_id: "88" } }))
    expect(result.current.pendiente.yaExistia).toBe(true)
  })

  it("ignora las subidas que no generan gasto", () => {
    const { result } = renderHook(() => useGastoDtopsPendiente())
    act(() => result.current.alSubirDocumento({ ...subidaDtops, tipoDocumento: "doda" }))
    act(() => result.current.alSubirDocumento({ ...subidaDtops, pais: "MX" }))
    expect(result.current.pendiente).toBeNull()
  })

  it("descarta el gasto pendiente al cerrar", () => {
    const { result } = renderHook(() => useGastoDtopsPendiente())
    act(() => result.current.alSubirDocumento(subidaDtops))
    act(() => result.current.cerrar())
    expect(result.current.pendiente).toBeNull()
  })
})
