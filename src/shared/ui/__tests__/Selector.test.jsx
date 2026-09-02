import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Selector } from "../Selector"

const OPCIONES = [
  { valor: "TODOS", etiqueta: "Todos" },
  { valor: "US", etiqueta: "USA" },
  { valor: "MX", etiqueta: "México" },
]

describe("Selector", () => {
  it("pinta una opción por entrada y marca la activa", () => {
    render(<Selector valor="US" onChange={() => {}} opciones={OPCIONES} />)

    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "USA" })).toHaveAttribute("aria-pressed", "true")
  })

  it("entrega el valor elegido", async () => {
    const alCambiar = vi.fn()
    render(<Selector valor="TODOS" onChange={alCambiar} opciones={OPCIONES} />)

    await userEvent.click(screen.getByRole("button", { name: "México" }))

    expect(alCambiar).toHaveBeenCalledWith("MX")
  })

  it("NO deja el filtro vacío al volver a pulsar la opción activa", async () => {
    const alCambiar = vi.fn()
    render(<Selector valor="US" onChange={alCambiar} opciones={OPCIONES} />)

    await userEvent.click(screen.getByRole("button", { name: "USA" }))

    // Sin esta guarda, ToggleButtonGroup entrega null y el filtro se queda sin
    // valor: la tabla sale vacía y nadie entiende por qué.
    expect(alCambiar).not.toHaveBeenCalled()
  })

  it("respeta las opciones deshabilitadas", () => {
    const alCambiar = vi.fn()
    render(
      <Selector
        valor="TODOS"
        onChange={alCambiar}
        opciones={[...OPCIONES, { valor: "CA", etiqueta: "Canadá", deshabilitada: true }]}
      />,
    )

    const canada = screen.getByRole("button", { name: "Canadá" })
    expect(canada).toBeDisabled()

    fireEvent.click(canada)
    expect(alCambiar).not.toHaveBeenCalled()
  })
})
