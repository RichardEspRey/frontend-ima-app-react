import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { renderHook } from "@testing-library/react"
import { Table, TableBody } from "@mui/material"
import {
  useCargaVisible,
  RETRASO_CARGA_MS,
  FilasEsqueleto,
  TarjetasEsqueleto,
  BloqueEsqueleto,
  PantallaEsqueleto,
} from "../carga"

describe("useCargaVisible", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("no avisa de una carga que termina enseguida", () => {
    const { result, rerender } = renderHook(({ c }) => useCargaVisible(c), {
      initialProps: { c: true },
    })

    act(() => vi.advanceTimersByTime(RETRASO_CARGA_MS - 50))
    expect(result.current).toBe(false)

    rerender({ c: false })
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe(false)
  })

  it("avisa cuando la espera se alarga", () => {
    const { result } = renderHook(() => useCargaVisible(true))

    act(() => vi.advanceTimersByTime(RETRASO_CARGA_MS))
    expect(result.current).toBe(true)
  })

  it("se apaga en cuanto llegan los datos, sin esperar nada", () => {
    const { result, rerender } = renderHook(({ c }) => useCargaVisible(c), {
      initialProps: { c: true },
    })

    act(() => vi.advanceTimersByTime(RETRASO_CARGA_MS))
    expect(result.current).toBe(true)

    rerender({ c: false })
    expect(result.current).toBe(false)
  })
})

/**
 * Envuelve unas filas en la tabla que necesitan para ser HTML válido.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children Las filas.
 * @returns {object} La tabla renderizada.
 */
const EnTabla = ({ children }) => (
  <Table>
    <TableBody>{children}</TableBody>
  </Table>
)

describe("FilasEsqueleto", () => {
  it("pinta una celda por columna en cada fila", () => {
    const { container } = render(
      <EnTabla>
        <FilasEsqueleto columnas={4} filas={3} />
      </EnTabla>,
    )

    expect(container.querySelectorAll("tr")).toHaveLength(3)
    expect(container.querySelectorAll("td")).toHaveLength(12)
  })

  it("anuncia la carga a quien no ve el esqueleto", () => {
    render(
      <EnTabla>
        <FilasEsqueleto columnas={2} />
      </EnTabla>,
    )

    expect(screen.getByRole("status")).toHaveTextContent("Cargando…")
  })

  it("anuncia una sola vez, no una por celda", () => {
    render(
      <EnTabla>
        <FilasEsqueleto columnas={5} filas={4} />
      </EnTabla>,
    )

    expect(screen.getAllByRole("status")).toHaveLength(1)
  })
})

describe("TarjetasEsqueleto", () => {
  it("pinta la cantidad pedida", () => {
    const { container } = render(<TarjetasEsqueleto cantidad={4} />)
    expect(container.querySelectorAll(".MuiPaper-root")).toHaveLength(4)
  })

  it("permite quitar el círculo del icono", () => {
    const { container: con } = render(<TarjetasEsqueleto cantidad={1} />)
    const { container: sin } = render(
      <TarjetasEsqueleto cantidad={1} conIcono={false} />,
    )

    expect(con.querySelectorAll(".MuiSkeleton-circular")).toHaveLength(1)
    expect(sin.querySelectorAll(".MuiSkeleton-circular")).toHaveLength(0)
  })

  it("anuncia la carga", () => {
    render(<TarjetasEsqueleto cantidad={2} />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})

describe("BloqueEsqueleto", () => {
  it("reserva la línea del título salvo que se le diga que no", () => {
    const { container: con } = render(<BloqueEsqueleto />)
    const { container: sin } = render(<BloqueEsqueleto conTitulo={false} />)

    expect(con.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(
      sin.querySelectorAll(".MuiSkeleton-root").length,
    )
  })

  it("anuncia la carga", () => {
    render(<BloqueEsqueleto />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})

describe("PantallaEsqueleto", () => {
  it("insinúa encabezado, acciones y tabla", () => {
    const { container } = render(<PantallaEsqueleto columnas={4} filas={3} />)
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(10)
  })

  it("anuncia la carga a quien no ve el esqueleto", () => {
    render(<PantallaEsqueleto />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando…")
  })
})
