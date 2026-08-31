import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataTable } from "../DataTable"

const COLUMNAS = [
  { id: "nombre", label: "Nombre", ordenable: true },
  { id: "sueldo", label: "Sueldo", ordenable: true, align: "right" },
  { id: "puesto", label: "Puesto" },
]

const FILAS = [
  { id: "1", nombre: "Carlos", sueldo: 300, puesto: "Mecánico" },
  { id: "2", nombre: "Ana", sueldo: 1000, puesto: "Velador" },
  { id: "3", nombre: "Beto", sueldo: 200, puesto: "" },
]

const textoDeFilas = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((fila) => within(fila).getAllByRole("cell")[0].textContent)

describe("DataTable", () => {
  it("pinta una fila por dato y una celda por columna", () => {
    render(<DataTable filas={FILAS} columnas={COLUMNAS} />)
    expect(screen.getAllByRole("row")).toHaveLength(FILAS.length + 1)
    expect(screen.getByText("Mecánico")).toBeInTheDocument()
  })

  it("muestra el estado de carga y ninguna fila de datos", () => {
    render(<DataTable filas={FILAS} columnas={COLUMNAS} cargando />)
    expect(screen.getByText("Cargando…")).toBeInTheDocument()
    expect(screen.queryByText("Carlos")).not.toBeInTheDocument()
  })

  it("el error gana sobre el estado vacío", () => {
    render(<DataTable filas={[]} columnas={COLUMNAS} error="No se pudo conectar" vacio="Sin registros" />)
    expect(screen.getByText("No se pudo conectar")).toBeInTheDocument()
    expect(screen.queryByText("Sin registros")).not.toBeInTheDocument()
  })

  it("muestra el texto de vacío cuando no hay filas", () => {
    render(<DataTable filas={[]} columnas={COLUMNAS} vacio="No hay personal." />)
    expect(screen.getByText("No hay personal.")).toBeInTheDocument()
  })

  it("tolera filas undefined sin reventar", () => {
    render(<DataTable filas={undefined} columnas={COLUMNAS} />)
    expect(screen.getByText("No hay registros.")).toBeInTheDocument()
  })

  it("ordena en el ciclo ascendente, descendente y sin orden", async () => {
    const usuario = userEvent.setup()
    render(<DataTable filas={FILAS} columnas={COLUMNAS} />)
    const cabecera = screen.getByRole("button", { name: /Nombre/ })

    expect(textoDeFilas()).toEqual(["Carlos", "Ana", "Beto"])

    await usuario.click(cabecera)
    expect(textoDeFilas()).toEqual(["Ana", "Beto", "Carlos"])

    await usuario.click(cabecera)
    expect(textoDeFilas()).toEqual(["Carlos", "Beto", "Ana"])

    await usuario.click(cabecera)
    expect(textoDeFilas()).toEqual(["Carlos", "Ana", "Beto"])
  })

  it("ordena los números como números, no como texto", async () => {
    const usuario = userEvent.setup()
    render(<DataTable filas={FILAS} columnas={COLUMNAS} />)

    await usuario.click(screen.getByRole("button", { name: /Sueldo/ }))
    const sueldos = screen
      .getAllByRole("row")
      .slice(1)
      .map((fila) => within(fila).getAllByRole("cell")[1].textContent)
    expect(sueldos).toEqual(["200", "300", "1000"])
  })

  it("manda los vacíos al final, ordene como ordene", async () => {
    const usuario = userEvent.setup()
    render(<DataTable filas={FILAS} columnas={[{ id: "puesto", label: "Puesto", ordenable: true }]} />)
    const cabecera = screen.getByRole("button", { name: /Puesto/ })

    await usuario.click(cabecera)
    expect(textoDeFilas().at(-1)).toBe("")

    await usuario.click(cabecera)
    expect(textoDeFilas().at(-1)).toBe("")
  })

  it("no ofrece ordenar por las columnas sin `ordenable`", () => {
    render(<DataTable filas={FILAS} columnas={COLUMNAS} />)
    expect(screen.queryByRole("button", { name: /Puesto/ })).not.toBeInTheDocument()
  })

  it("usa `render` para el contenido y `valor` para ordenar", async () => {
    const usuario = userEvent.setup()
    render(
      <DataTable
        filas={FILAS}
        columnas={[
          {
            id: "sueldo",
            label: "Sueldo",
            ordenable: true,
            valor: (f) => f.sueldo,
            render: (f) => `$${f.sueldo}.00`,
          },
        ]}
      />,
    )
    expect(screen.getByText("$300.00")).toBeInTheDocument()

    await usuario.click(screen.getByRole("button", { name: /Sueldo/ }))
    expect(textoDeFilas()).toEqual(["$200.00", "$300.00", "$1000.00"])
  })

  it("avisa del clic en una fila con el dato completo", async () => {
    const usuario = userEvent.setup()
    const alClic = vi.fn()
    render(<DataTable filas={FILAS} columnas={COLUMNAS} onFilaClick={alClic} />)

    await usuario.click(screen.getByText("Ana"))
    expect(alClic).toHaveBeenCalledWith(FILAS[1])
  })

  it("delega el orden hacia afuera cuando es controlado", async () => {
    const usuario = userEvent.setup()
    const alCambiar = vi.fn()
    render(
      <DataTable
        filas={FILAS}
        columnas={COLUMNAS}
        orden={{ campo: null, dir: null }}
        onOrdenChange={alCambiar}
      />,
    )

    await usuario.click(screen.getByRole("button", { name: /Nombre/ }))
    expect(alCambiar).toHaveBeenCalledWith({ campo: "nombre", dir: "asc" })
    expect(textoDeFilas()).toEqual(["Carlos", "Ana", "Beto"])
  })

  it("no muta el arreglo que recibe", async () => {
    const usuario = userEvent.setup()
    const original = [...FILAS]
    render(<DataTable filas={FILAS} columnas={COLUMNAS} />)

    await usuario.click(screen.getByRole("button", { name: /Nombre/ }))
    expect(FILAS).toEqual(original)
  })
})
