import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import HomeIcon from "@mui/icons-material/Home"
import { Pestanas } from "../Pestanas"

const PESTANAS = [
  { id: "pendientes", etiqueta: "Pendientes" },
  { id: "listos", etiqueta: "Completados" },
]

describe("Pestanas", () => {
  it("pinta una pestaña por entrada", () => {
    render(<Pestanas valor="pendientes" onChange={() => {}} pestanas={PESTANAS} />)

    expect(screen.getByRole("tab", { name: "Pendientes" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Completados" })).toBeInTheDocument()
  })

  it("marca cuál está activa", () => {
    render(<Pestanas valor="listos" onChange={() => {}} pestanas={PESTANAS} />)

    expect(screen.getByRole("tab", { name: "Completados" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })

  it("entrega el valor, no el evento", async () => {
    const alCambiar = vi.fn()
    render(<Pestanas valor="pendientes" onChange={alCambiar} pestanas={PESTANAS} />)

    await userEvent.click(screen.getByRole("tab", { name: "Completados" }))

    expect(alCambiar).toHaveBeenCalledWith("listos")
  })

  it("usa la posición cuando la pestaña no trae id, como hace Tabs", async () => {
    const alCambiar = vi.fn()
    render(
      <Pestanas
        valor={0}
        onChange={alCambiar}
        pestanas={[{ etiqueta: "Uno" }, { etiqueta: "Dos" }]}
      />,
    )

    await userEvent.click(screen.getByRole("tab", { name: "Dos" }))

    expect(alCambiar).toHaveBeenCalledWith(1)
  })

  it("admite icono sin que haya que colocarlo a mano", () => {
    render(
      <Pestanas
        valor={0}
        onChange={() => {}}
        pestanas={[{ etiqueta: "Inicio", icono: <HomeIcon data-testid="icono" /> }]}
      />,
    )

    expect(screen.getByTestId("icono")).toBeInTheDocument()
  })

  it("respeta las pestañas deshabilitadas", () => {
    const alCambiar = vi.fn()
    render(
      <Pestanas
        valor={0}
        onChange={alCambiar}
        pestanas={[{ etiqueta: "Uno" }, { etiqueta: "Dos", deshabilitada: true }]}
      />,
    )

    const dos = screen.getByRole("tab", { name: "Dos" })
    expect(dos).toBeDisabled()

    fireEvent.click(dos)
    expect(alCambiar).not.toHaveBeenCalled()
  })

  it("no pinta la línea inferior de MUI: la pastilla ya marca la activa", () => {
    const { container } = render(
      <Pestanas valor="pendientes" onChange={() => {}} pestanas={PESTANAS} />,
    )

    const indicador = container.querySelector(".MuiTabs-indicator")
    expect(indicador).toHaveStyle({ display: "none" })
  })
})
