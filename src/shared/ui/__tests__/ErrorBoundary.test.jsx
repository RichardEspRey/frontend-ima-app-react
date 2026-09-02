import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ErrorBoundary } from "../ErrorBoundary"
import { EstadoError, describirError } from "../EstadoError"
import { ApiError, CAUSA_ERROR } from "../../api/errors"

/**
 * Un componente que revienta cuando se le pide.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.falla Si debe lanzar.
 * @returns {object} Un texto, si no lanza.
 */
function Bomba({ falla }) {
  if (falla) throw new Error("Cannot read properties of undefined (reading 'x')")
  return <p>contenido</p>
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}))
afterEach(() => vi.restoreAllMocks())

describe("ErrorBoundary", () => {
  it("deja pasar a los hijos cuando no hay fallo", () => {
    render(
      <ErrorBoundary clave="/a">
        <Bomba falla={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText("contenido")).toBeInTheDocument()
  })

  it("atrapa el fallo en vez de dejar la pantalla en blanco", () => {
    render(
      <ErrorBoundary clave="/a">
        <Bomba falla />
      </ErrorBoundary>,
    )
    expect(screen.getByText("Esta pantalla no se pudo mostrar")).toBeInTheDocument()
  })

  it("no le enseña el texto técnico a quien no lo pidió", () => {
    render(
      <ErrorBoundary clave="/a">
        <Bomba falla />
      </ErrorBoundary>,
    )
    expect(screen.queryByText(/Cannot read properties/)).not.toBeInTheDocument()
  })

  it("enseña el detalle técnico a quien lo pide, para poder reportarlo", async () => {
    render(
      <ErrorBoundary clave="/a">
        <Bomba falla />
      </ErrorBoundary>,
    )

    await userEvent.click(screen.getByRole("button", { name: /detalle técnico/i }))
    expect(screen.getByText(/Cannot read properties/)).toBeInTheDocument()
  })

  it("olvida el error al cambiar de pantalla", () => {
    const { rerender } = render(
      <ErrorBoundary clave="/a">
        <Bomba falla />
      </ErrorBoundary>,
    )
    expect(screen.getByText("Esta pantalla no se pudo mostrar")).toBeInTheDocument()

    rerender(
      <ErrorBoundary clave="/b">
        <Bomba falla={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText("contenido")).toBeInTheDocument()
  })

  it("mantiene el error si se vuelve a pintar la misma pantalla", () => {
    const { rerender } = render(
      <ErrorBoundary clave="/a">
        <Bomba falla />
      </ErrorBoundary>,
    )
    rerender(
      <ErrorBoundary clave="/a">
        <Bomba falla />
      </ErrorBoundary>,
    )
    expect(screen.getByText("Esta pantalla no se pudo mostrar")).toBeInTheDocument()
  })
})

describe("describirError", () => {
  it("respeta el mensaje de un ApiError y le añade qué hacer", () => {
    const info = describirError(
      new ApiError({
        mensaje: "No se pudo conectar con el servidor.",
        causa: CAUSA_ERROR.RED,
        endpoint: "viajes.php",
        op: "getAll",
      }),
    )

    expect(info.mensaje).toBe("No se pudo conectar con el servidor.")
    expect(info.sugerencia).toMatch(/conexión/)
    expect(info.tecnico).toContain("viajes.php")
  })

  it("distingue un fallo de negocio de uno de carga", () => {
    const negocio = describirError(
      new ApiError({
        mensaje: "Ese empleado ya existe.",
        causa: CAUSA_ERROR.NEGOCIO,
        endpoint: "personal.php",
        op: "crear",
      }),
    )

    expect(negocio.titulo).toBe("No se pudo completar la operación")
    expect(negocio.sugerencia).toBeNull()
  })

  it("no enseña el texto crudo de un error que no es de la API", () => {
    const info = describirError(new TypeError("undefined is not a function"))
    expect(info.mensaje).not.toMatch(/undefined/)
    expect(info.tecnico).toMatch(/undefined/)
  })
})

describe("EstadoError", () => {
  it("solo ofrece reintentar si hay algo que reintentar", () => {
    const { rerender } = render(<EstadoError error={new Error("x")} />)
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument()

    rerender(<EstadoError error={new Error("x")} onReintentar={() => {}} />)
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument()
  })

  it("llama a reintentar al pulsarlo", async () => {
    const reintentar = vi.fn()
    render(<EstadoError error={new Error("x")} onReintentar={reintentar} />)

    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }))
    expect(reintentar).toHaveBeenCalledTimes(1)
  })
})
