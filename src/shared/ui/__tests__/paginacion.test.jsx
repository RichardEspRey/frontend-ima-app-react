import { describe, it, expect, vi } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { renderHook } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { usePaginacion, Paginacion } from "../paginacion"

const filas = (n) => Array.from({ length: n }, (_, i) => ({ id: i }))

describe("usePaginacion", () => {
  it("recorta a la primera página", () => {
    const { result } = renderHook(() => usePaginacion(filas(60), { porPagina: 25 }))

    expect(result.current.visibles).toHaveLength(25)
    expect(result.current.visibles[0].id).toBe(0)
    expect(result.current.total).toBe(60)
  })

  it("la última página trae solo lo que queda", () => {
    const { result } = renderHook(() => usePaginacion(filas(60), { porPagina: 25 }))

    act(() => result.current.irAPagina(2))
    expect(result.current.visibles).toHaveLength(10)
    expect(result.current.visibles[0].id).toBe(50)
  })

  it("vuelve a la primera al cambiar el tamaño de página", () => {
    const { result } = renderHook(() => usePaginacion(filas(60), { porPagina: 25 }))

    act(() => result.current.irAPagina(2))
    act(() => result.current.cambiarPorPagina(50))

    expect(result.current.pagina).toBe(0)
    expect(result.current.visibles).toHaveLength(50)
  })

  it("NO deja la vista más allá del final cuando el filtro reduce las filas", () => {
    const { result, rerender } = renderHook(({ f }) => usePaginacion(f, { porPagina: 25 }), {
      initialProps: { f: filas(60) },
    })

    act(() => result.current.irAPagina(2))
    expect(result.current.visibles).toHaveLength(10)

    // El usuario filtra y quedan 10 filas: la página 2 ya no existe.
    rerender({ f: filas(10) })

    // Sin la acotación, aquí se vería una tabla vacía con datos que sí están.
    expect(result.current.pagina).toBe(0)
    expect(result.current.visibles).toHaveLength(10)
  })

  it("aguanta una lista vacía", () => {
    const { result } = renderHook(() => usePaginacion([]))

    expect(result.current.visibles).toEqual([])
    expect(result.current.pagina).toBe(0)
    expect(result.current.total).toBe(0)
  })
})

describe("Paginacion", () => {
  it("dice cuántas filas hay y cuáles se ven", () => {
    render(
      <Paginacion pagina={0} porPagina={25} total={60} onPagina={() => {}} onPorPagina={() => {}} />,
    )
    expect(screen.getByText("1–25 de 60")).toBeInTheDocument()
  })

  it("avisa al pasar de página", async () => {
    const alPagina = vi.fn()
    render(
      <Paginacion pagina={0} porPagina={25} total={60} onPagina={alPagina} onPorPagina={() => {}} />,
    )

    await userEvent.click(screen.getByRole("button", { name: /siguiente|next/i }))
    expect(alPagina).toHaveBeenCalledWith(1)
  })
})
