import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SelectorBusqueda } from "../SelectorBusqueda"

const PAISES = [
  { value: "MX", label: "México" },
  { value: "US", label: "Estados Unidos" },
]

describe("SelectorBusqueda · el contrato con react-select", () => {
  it("entrega el OBJETO completo, no el valor suelto", async () => {
    // Es la prueba que protege el envío. Las pantallas guardan la opción entera
    // y sacan el dato después con `country?.value`. Si esto entregara "MX", ese
    // acceso daría undefined, la capa de API omite los undefined, y el registro
    // se guardaría sin país sin que nadie viera un error.
    const alCambiar = vi.fn()
    render(<SelectorBusqueda options={PAISES} value={null} onChange={alCambiar} />)

    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(screen.getByText("México"))

    expect(alCambiar).toHaveBeenCalledWith({ value: "MX", label: "México" })
  })

  it("entrega null al limpiar, como react-select", async () => {
    const alCambiar = vi.fn()
    render(
      <SelectorBusqueda options={PAISES} value={PAISES[0]} onChange={alCambiar} />,
    )

    await userEvent.click(screen.getByLabelText(/clear/i))

    expect(alCambiar).toHaveBeenCalledWith(null)
  })

  it("muestra la opción elegida", () => {
    render(<SelectorBusqueda options={PAISES} value={PAISES[1]} onChange={() => {}} />)
    expect(screen.getByRole("combobox")).toHaveValue("Estados Unidos")
  })

  it("reconoce un valor equivalente aunque sea otro objeto", () => {
    // Pasa siempre que el valor viene del servidor y las opciones se piden
    // aparte: son dos objetos distintos con el mismo `value`. Comparando por
    // identidad, el campo se vería vacío teniendo dato.
    render(
      <SelectorBusqueda
        options={PAISES}
        value={{ value: "MX", label: "México" }}
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole("combobox")).toHaveValue("México")
  })

  it("aguanta que el valor sea null o undefined", () => {
    expect(() =>
      render(<SelectorBusqueda options={PAISES} value={undefined} onChange={() => {}} />),
    ).not.toThrow()

    expect(screen.getByRole("combobox")).toHaveValue("")
  })

  it("filtra al escribir, que es para lo que sirve", async () => {
    render(<SelectorBusqueda options={PAISES} value={null} onChange={() => {}} />)

    await userEvent.type(screen.getByRole("combobox"), "Esta")

    expect(screen.getByText("Estados Unidos")).toBeInTheDocument()
    expect(screen.queryByText("México")).not.toBeInTheDocument()
  })

  it("no deja elegir cuando está bloqueado", () => {
    render(
      <SelectorBusqueda options={PAISES} value={null} onChange={() => {}} isDisabled />,
    )
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("no ofrece limpiar cuando no se permite", () => {
    render(
      <SelectorBusqueda
        options={PAISES}
        value={PAISES[0]}
        onChange={() => {}}
        isClearable={false}
      />,
    )
    expect(screen.queryByLabelText(/clear/i)).not.toBeInTheDocument()
  })

  it("avisa mientras las opciones están llegando", () => {
    render(<SelectorBusqueda options={[]} value={null} onChange={() => {}} isLoading />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })
})

describe("SelectorBusqueda · crear opciones al vuelo", () => {
  it("ofrece crear cuando lo escrito no existe", async () => {
    render(
      <SelectorBusqueda
        options={PAISES}
        value={null}
        onChange={() => {}}
        onCrear={() => {}}
        permitirCrear
      />,
    )

    await userEvent.type(screen.getByRole("combobox"), "Canadá")
    expect(screen.getByText('Crear: "Canadá"')).toBeInTheDocument()
  })

  it("NO ofrece crear algo que ya existe", async () => {
    render(
      <SelectorBusqueda
        options={PAISES}
        value={null}
        onChange={() => {}}
        onCrear={() => {}}
        permitirCrear
      />,
    )

    await userEvent.type(screen.getByRole("combobox"), "México")
    expect(screen.queryByText(/^Crear:/)).not.toBeInTheDocument()
  })

  it("manda el texto a onCrear y NO a onChange", async () => {
    // La entrada de "crear" no tiene `value`. Si llegara a onChange, la pantalla
    // guardaría una opción sin dato y el envío llevaría basura.
    const alCambiar = vi.fn()
    const alCrear = vi.fn()
    render(
      <SelectorBusqueda
        options={PAISES}
        value={null}
        onChange={alCambiar}
        onCrear={alCrear}
        permitirCrear
      />,
    )

    await userEvent.type(screen.getByRole("combobox"), "Canadá")
    await userEvent.click(screen.getByText('Crear: "Canadá"'))

    expect(alCrear).toHaveBeenCalledWith("Canadá")
    expect(alCambiar).not.toHaveBeenCalled()
  })

  it("no ofrece crear si no se le pidió", async () => {
    render(<SelectorBusqueda options={PAISES} value={null} onChange={() => {}} />)

    await userEvent.type(screen.getByRole("combobox"), "Canadá")
    expect(screen.queryByText(/^Crear:/)).not.toBeInTheDocument()
  })
})
