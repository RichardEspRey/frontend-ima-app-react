import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CampoFecha, aTextoFecha, aFecha } from "../CampoFecha"

describe("aTextoFecha · la conversión que NO pasa por UTC", () => {
  it("respeta el día local sin importar la hora", () => {
    // Es el fallo que traía la app: con `toISOString()`, un registro capturado
    // el 2 a las 19:00 en Monterrey se guardaba como día 3, porque en UTC ya
    // era el día siguiente.
    for (const hora of [0, 6, 12, 18, 20, 23]) {
      expect(aTextoFecha(new Date(2026, 8, 2, hora, 30))).toBe("2026-09-02")
    }
  })

  it("es lo contrario de lo que hacía toISOString a las 19:00", () => {
    const tarde = new Date(2026, 8, 2, 19, 0)
    const conUtc = tarde.toISOString().split("T")[0]

    expect(aTextoFecha(tarde)).toBe("2026-09-02")
    // Se deja escrito para que nadie “simplifique” volviendo a toISOString.
    expect(conUtc).not.toBe("2026-09-02")
  })

  it("rellena con ceros el mes y el día", () => {
    expect(aTextoFecha(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("acepta un texto que ya viene del servidor", () => {
    expect(aTextoFecha("2026-09-02")).toBe("2026-09-02")
    expect(aTextoFecha("2026-09-02 13:45:00")).toBe("2026-09-02")
  })

  it("devuelve vacío para lo que no es una fecha", () => {
    expect(aTextoFecha(null)).toBe("")
    expect(aTextoFecha(undefined)).toBe("")
    expect(aTextoFecha("")).toBe("")
    expect(aTextoFecha(new Date("nada"))).toBe("")
  })
})

describe("aFecha · la vuelta, también local", () => {
  it("construye la fecha en hora local, no en UTC", () => {
    const d = aFecha("2026-09-02")

    // `new Date("2026-09-02")` daría medianoche UTC, que en México es el día 1
    // por la tarde. Por eso se construye con año, mes y día por separado.
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(8)
    expect(d.getDate()).toBe(2)
  })

  it("ida y vuelta conserva el día", () => {
    const original = new Date(2026, 8, 2, 20, 0)
    expect(aTextoFecha(aFecha(aTextoFecha(original)))).toBe("2026-09-02")
  })

  it("devuelve null cuando no hay nada", () => {
    expect(aFecha("")).toBeNull()
    expect(aFecha(null)).toBeNull()
  })
})

describe("CampoFecha · el contrato con react-datepicker", () => {
  it("entrega un objeto Date, no un texto", () => {
    // Las pantallas hacen `fecha.getFullYear()` y cosas así. Si esto entregara
    // un texto, esas llamadas reventarían al guardar.
    const alCambiar = vi.fn()
    render(<CampoFecha value={null} onChange={alCambiar} label="Fecha" />)

    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-09-02" } })

    const entregado = alCambiar.mock.calls[0][0]
    expect(entregado).toBeInstanceOf(Date)
    expect(aTextoFecha(entregado)).toBe("2026-09-02")
  })

  it("entrega null al vaciar el campo", () => {
    const alCambiar = vi.fn()
    render(<CampoFecha value={new Date(2026, 8, 2)} onChange={alCambiar} label="Fecha" />)

    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "" } })

    expect(alCambiar).toHaveBeenCalledWith(null)
  })

  it("muestra la fecha que se le da", () => {
    render(<CampoFecha value={new Date(2026, 8, 2)} onChange={() => {}} label="Fecha" />)
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-09-02")
  })

  it("acepta una fecha en texto, como llega del servidor", () => {
    render(<CampoFecha value="2026-09-02" onChange={() => {}} label="Fecha" />)
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-09-02")
  })

  it("se puede bloquear", () => {
    render(<CampoFecha value={null} onChange={() => {}} label="Fecha" disabled />)
    expect(screen.getByLabelText("Fecha")).toBeDisabled()
  })
})
