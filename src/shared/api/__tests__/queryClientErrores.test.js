import { describe, it, expect, vi } from "vitest"
import { crearQueryClient } from "../queryClient"
import { ApiError, CAUSA_ERROR } from "../errors"

/**
 * Ejecuta una consulta que falla y espera a que el cliente lo procese.
 *
 * @param {object} cliente El cliente de TanStack Query.
 * @param {Error} error Lo que debe lanzar la consulta.
 * @param {object} [meta] Metadatos de la consulta, por ejemplo `{ silencioso: true }`.
 * @returns {Promise.<void>} Cuando la consulta ya falló.
 */
async function consultaQueFalla(cliente, error, meta) {
  await cliente
    .fetchQuery({
      queryKey: ["falla", Math.random()],
      queryFn: () => Promise.reject(error),
      ...(meta ? { meta } : {}),
    })
    .catch(() => {})
}

const apiError = (causa) =>
  new ApiError({ mensaje: "falló", causa, endpoint: "viajes.php", op: "getAll" })

describe("crearQueryClient · avisos de fallo", () => {
  it("avisa cuando una consulta falla, aunque la pantalla no mire el error", async () => {
    const alFallar = vi.fn()
    vi.spyOn(console, "error").mockImplementation(() => {})

    await consultaQueFalla(crearQueryClient({ alFallar }), apiError(CAUSA_ERROR.RED))

    expect(alFallar).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it("no avisa de un sondeo de fondo marcado como silencioso", async () => {
    const alFallar = vi.fn()
    vi.spyOn(console, "error").mockImplementation(() => {})

    await consultaQueFalla(
      crearQueryClient({ alFallar }),
      apiError(CAUSA_ERROR.RED),
      { silencioso: true },
    )

    expect(alFallar).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it("un sondeo silencioso sigue dejando rastro en la consola", async () => {
    const enConsola = vi.spyOn(console, "error").mockImplementation(() => {})

    await consultaQueFalla(crearQueryClient(), apiError(CAUSA_ERROR.RED), { silencioso: true })

    expect(enConsola).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it("una consulta normal sí avisa, para que silencioso no se vuelva el comportamiento por omisión", async () => {
    const alFallar = vi.fn()
    vi.spyOn(console, "error").mockImplementation(() => {})

    await consultaQueFalla(crearQueryClient({ alFallar }), apiError(CAUSA_ERROR.RED), {})

    expect(alFallar).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it("no avisa de una consulta cancelada: cambiar de pantalla no es un fallo", async () => {
    const alFallar = vi.fn()

    await consultaQueFalla(crearQueryClient({ alFallar }), apiError(CAUSA_ERROR.CANCELADA))

    expect(alFallar).not.toHaveBeenCalled()
  })

  it("funciona sin que nadie le pase qué hacer", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(
      consultaQueFalla(crearQueryClient(), apiError(CAUSA_ERROR.RED)),
    ).resolves.toBeUndefined()

    vi.restoreAllMocks()
  })
})
