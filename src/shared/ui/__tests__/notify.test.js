import { describe, it, expect, vi, beforeEach } from "vitest"
import Swal from "sweetalert2"
import { notify } from "../notify"
import { COLOR } from "../tokens"

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) },
}))

const ultimaLlamada = () => Swal.fire.mock.calls.at(-1)[0]

beforeEach(() => vi.clearAllMocks())

describe("notify", () => {
  it("exito usa el icono correcto", async () => {
    await notify.exito("Guardado")
    expect(ultimaLlamada()).toMatchObject({ icon: "success", text: "Guardado" })
  })

  it("error acepta una cadena", async () => {
    await notify.error("Algo falló")
    expect(ultimaLlamada()).toMatchObject({ icon: "error", text: "Algo falló" })
  })

  it("error acepta un Error y saca su mensaje", async () => {
    await notify.error(new Error("Sin conexión"))
    expect(ultimaLlamada().text).toBe("Sin conexión")
  })

  it("aviso usa el icono de advertencia", async () => {
    await notify.aviso("Falta el nombre")
    expect(ultimaLlamada()).toMatchObject({ icon: "warning", text: "Falta el nombre" })
  })

  it("confirmar devuelve un booleano, no el objeto de la librería", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    await expect(notify.confirmar({ titulo: "¿Seguro?" })).resolves.toBe(true)

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false, isDismissed: true })
    await expect(notify.confirmar({ titulo: "¿Seguro?" })).resolves.toBe(false)
  })

  it("confirmar pinta de rojo el botón por omisión, por ser destructivo", async () => {
    await notify.confirmar({ titulo: "¿Borrar?" })
    expect(ultimaLlamada().confirmButtonColor).toBe(COLOR.PELIGRO)
  })

  it("confirmar permite desactivar el rojo cuando no es destructivo", async () => {
    await notify.confirmar({ titulo: "¿Continuar?", peligroso: false })
    expect(ultimaLlamada().confirmButtonColor).not.toBe("#d32f2f")
  })

  it("un cierre sin isConfirmed cuenta como no aceptado", async () => {
    Swal.fire.mockResolvedValueOnce({})
    await expect(notify.confirmar({ titulo: "¿Seguro?" })).resolves.toBe(false)
  })
})
