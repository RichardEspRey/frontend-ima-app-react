import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatCard } from "../StatCard"

describe("StatCard", () => {
  it("muestra etiqueta, cifra y pie", () => {
    render(<StatCard etiqueta="Nómina total" valor="$18,800.00" pie="Pagado a 7 empleado(s)" />)
    expect(screen.getByText("Nómina total")).toBeInTheDocument()
    expect(screen.getByText("$18,800.00")).toBeInTheDocument()
    expect(screen.getByText("Pagado a 7 empleado(s)")).toBeInTheDocument()
  })

  it("el pie es opcional", () => {
    const { container } = render(<StatCard etiqueta="Plantilla" valor="8 empleados" />)
    expect(container.textContent).toBe("Plantilla8 empleados")
  })

  it("acepta una cifra que no sea texto", () => {
    render(<StatCard etiqueta="Total" valor={42} />)
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("el acento tiñe la cifra, no la tarjeta", () => {
    render(<StatCard etiqueta="Total" valor="$1.00" acento="rgb(21, 128, 61)" />)
    expect(screen.getByText("$1.00")).toHaveStyle({ color: "rgb(21, 128, 61)" })
  })

  it("sin acento usa el gris oscuro del sistema", () => {
    render(<StatCard etiqueta="Total" valor="$1.00" />)
    expect(screen.getByText("$1.00")).toHaveStyle({ color: "rgb(15, 23, 42)" })
  })

  it("el icono es opcional y no rompe el render", () => {
    render(<StatCard etiqueta="Total" valor="$1.00" icono={<span data-testid="ico" />} />)
    expect(screen.getByTestId("ico")).toBeInTheDocument()
  })
})
