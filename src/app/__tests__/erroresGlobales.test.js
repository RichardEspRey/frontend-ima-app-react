import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ApiError, CAUSA_ERROR } from "../../shared/api/errors"
import { notify } from "../../shared/ui/notify"
import {
  mensajeDeFallo,
  esRepetido,
  olvidarAvisos,
  instalarErroresGlobales,
  SILENCIO_REPETIDO_MS,
} from "../erroresGlobales"

vi.mock("../../shared/ui/notify", () => ({
  notify: { error: vi.fn(), discreto: vi.fn() },
}))

/**
 * Un `ApiError` con la causa que pida la prueba.
 *
 * @param {string} causa Un valor de `CAUSA_ERROR`.
 * @param {string} [mensaje] Texto del error.
 * @returns {ApiError} El error construido.
 */
const apiError = (causa, mensaje = "No se pudo conectar con el servidor.") =>
  new ApiError({ mensaje, causa, endpoint: "viajes.php", op: "getAll" })

beforeEach(() => {
  olvidarAvisos()
  vi.clearAllMocks()
})

describe("mensajeDeFallo", () => {
  it("respeta el mensaje de un ApiError, que ya está escrito para leerse", () => {
    expect(mensajeDeFallo(apiError(CAUSA_ERROR.RED))).toBe(
      "No se pudo conectar con el servidor.",
    )
  })

  it("calla las cancelaciones: cambiar de pantalla no es un fallo", () => {
    expect(mensajeDeFallo(apiError(CAUSA_ERROR.CANCELADA))).toBeNull()
  })

  it("traduce el fallo de red de fetch, que llega como TypeError", () => {
    expect(mensajeDeFallo(new TypeError("Failed to fetch"))).toMatch(/conexión/)
  })

  it("no enseña el texto técnico de un error cualquiera", () => {
    const mensaje = mensajeDeFallo(
      new TypeError("Cannot read properties of undefined (reading 'x')"),
    )
    expect(mensaje).not.toMatch(/undefined/)
    expect(mensaje).toMatch(/segundo plano/)
  })
})

describe("esRepetido", () => {
  it("deja pasar el primero", () => {
    expect(esRepetido("falló", 1000)).toBe(false)
  })

  it("calla el mismo mensaje dentro de la ventana", () => {
    esRepetido("falló", 1000)
    expect(esRepetido("falló", 1000 + SILENCIO_REPETIDO_MS - 1)).toBe(true)
  })

  it("vuelve a dejarlo pasar cuando la ventana expira", () => {
    esRepetido("falló", 1000)
    expect(esRepetido("falló", 1000 + SILENCIO_REPETIDO_MS)).toBe(false)
  })

  it("no confunde dos mensajes distintos", () => {
    esRepetido("uno", 1000)
    expect(esRepetido("otro", 1000)).toBe(false)
  })
})

describe("instalarErroresGlobales", () => {
  let ventana
  let manejadores

  beforeEach(() => {
    manejadores = {}
    ventana = {
      addEventListener: (tipo, fn) => {
        manejadores[tipo] = fn
      },
      removeEventListener: (tipo) => {
        delete manejadores[tipo]
      },
    }
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => vi.restoreAllMocks())

  it("avisa de una promesa rechazada sin manejar", () => {
    instalarErroresGlobales(ventana)
    manejadores.unhandledrejection({ reason: apiError(CAUSA_ERROR.RED) })

    expect(notify.discreto).toHaveBeenCalledWith("No se pudo conectar con el servidor.")
  })

  it("no avisa de una petición cancelada", () => {
    instalarErroresGlobales(ventana)
    manejadores.unhandledrejection({ reason: apiError(CAUSA_ERROR.CANCELADA) })

    expect(notify.discreto).not.toHaveBeenCalled()
  })

  it("no apila seis avisos idénticos de una ráfaga", () => {
    instalarErroresGlobales(ventana)
    for (let i = 0; i < 6; i += 1) {
      manejadores.unhandledrejection({ reason: apiError(CAUSA_ERROR.RED) })
    }

    expect(notify.discreto).toHaveBeenCalledTimes(1)
  })

  it("deja de escuchar al desinstalar", () => {
    const desinstalar = instalarErroresGlobales(ventana)
    desinstalar()

    expect(manejadores.unhandledrejection).toBeUndefined()
    expect(manejadores.error).toBeUndefined()
  })
})

describe("avisarDeFallo, el único punto por el que sale un aviso", () => {
  it("no apila el aviso de una consulta y el de una promesa por el mismo fallo", async () => {
    const { avisarDeFallo } = await import("../erroresGlobales")
    olvidarAvisos()

    avisarDeFallo(apiError(CAUSA_ERROR.RED))
    avisarDeFallo(apiError(CAUSA_ERROR.RED))

    expect(notify.discreto).toHaveBeenCalledTimes(1)
  })
})
