import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const reproducir = vi.fn(() => Promise.resolve())

vi.mock("../../../shared/ui", () => ({
  notify: { discreto: vi.fn() },
}))
vi.mock("../../../assets/sounds/update.mp3", () => ({ default: "update.mp3" }))
vi.mock("../../../shared/auth", () => ({
  PERMISOS: { MANT_INSPECCION_FINAL: "mant_inspeccion_final" },
  useSesion: () => ({ can: () => true }),
}))

vi.stubGlobal(
  "Audio",
  class {
    /**
     * Simula la reproducción del sonido de notificación.
     *
     * @returns {Promise} La promesa que devuelve el navegador al reproducir.
     */
    play() {
      return reproducir()
    }
  },
)

const { useAvisoDeNotificaciones } = await import("../model/useAvisoDeNotificaciones")
const { notify } = await import("../../../shared/ui")
const entidad = await import("../../../entities/notification")
const mantenimiento = await import("../../../entities/maintenance-point")

/**
 * Envuelve el hook en un cliente de consultas propio de cada prueba.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children El árbol a envolver.
 * @returns {object} El proveedor con su cliente.
 */
function Envoltura({ children }) {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
}

/**
 * Simula lo que devuelve la entidad, sin tocar la red.
 *
 * @param {Array.<object>} notificaciones Lo que trae el servidor.
 * @returns {void}
 */
function servidorDevuelve(notificaciones) {
  vi.spyOn(entidad, "useNotificacionesNuevas").mockReturnValue({ data: notificaciones })
}

/**
 * Simula las inspecciones que llegan a Reparaciones.
 *
 * @param {Array.<object>} avisos Los avisos de inspección.
 * @returns {void}
 */
function llegan(avisos) {
  vi.spyOn(mantenimiento, "useAvisosDeInspecciones").mockReturnValue({ avisos, cargados: true })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(mantenimiento, "useAvisosDeInspecciones").mockReturnValue({ avisos: [], cargados: false })
})
afterEach(() => vi.restoreAllMocks())

describe("useAvisoDeNotificaciones", () => {
  it("anuncia cada notificación nueva como aviso flotante, no como diálogo", async () => {
    servidorDevuelve([
      { id: "1", mensaje: "El trip 199 llegó a destino" },
      { id: "2", mensaje: "Gasto #1726 aprobado" },
    ])

    renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })

    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(2))
    expect(notify.discreto).toHaveBeenCalledWith("El trip 199 llegó a destino", "info")
    expect(notify.discreto).toHaveBeenCalledWith("Gasto #1726 aprobado", "info")
  })

  it("no repite una notificación ya anunciada cuando el sondeo la vuelve a traer", async () => {
    servidorDevuelve([{ id: "1", mensaje: "una" }])

    const { rerender } = renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })
    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(1))

    rerender()
    rerender()

    expect(notify.discreto).toHaveBeenCalledTimes(1)
  })

  it("suena una sola vez por tanda, no una por notificación", async () => {
    servidorDevuelve([
      { id: "1", mensaje: "una" },
      { id: "2", mensaje: "otra" },
      { id: "3", mensaje: "y otra" },
    ])

    renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })

    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(3))
    expect(reproducir).toHaveBeenCalledTimes(1)
  })

  it("no suena ni avisa cuando no hay nada nuevo", async () => {
    servidorDevuelve([])

    renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })

    await waitFor(() => expect(notify.discreto).not.toHaveBeenCalled())
    expect(reproducir).not.toHaveBeenCalled()
  })

  it("si el navegador bloquea el audio, el aviso igual se muestra", async () => {
    reproducir.mockRejectedValueOnce(new Error("play() failed: no user gesture"))
    servidorDevuelve([{ id: "1", mensaje: "una" }])

    renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })

    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(1))
  })

  it("aguanta que la consulta todavía no haya devuelto nada", async () => {
    vi.spyOn(entidad, "useNotificacionesNuevas").mockReturnValue({ data: undefined })

    const { result } = renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })

    expect(result.current).toEqual([])
    expect(notify.discreto).not.toHaveBeenCalled()
  })

  it("anuncia cada tanda que entrega el servidor, aunque repita el texto", async () => {
    servidorDevuelve([{ id: "1", mensaje: "una" }])

    const { rerender } = renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })
    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(1))

    servidorDevuelve([{ id: "2", mensaje: "una" }])
    rerender()

    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(2))
  })

  it("no anuncia las inspecciones que ya estaban al entrar, sí las que llegan después", async () => {
    servidorDevuelve([])
    const vieja = { id: "inspeccion-264-camion", clFinalId: "264", operador: "Juan Manuel Ruiz Torres" }
    const nueva = { id: "inspeccion-266-camion", clFinalId: "266", operador: "Alberto Cruz Galindo" }
    llegan([vieja])

    const { rerender } = renderHook(() => useAvisoDeNotificaciones("7"), { wrapper: Envoltura })
    expect(notify.discreto).not.toHaveBeenCalled()

    llegan([nueva, vieja])
    rerender()

    await waitFor(() => expect(notify.discreto).toHaveBeenCalledTimes(1))
    expect(notify.discreto).toHaveBeenCalledWith("Nueva inspección #266 · Alberto Cruz Galindo", "info")
    expect(reproducir).toHaveBeenCalledTimes(1)
  })
})
