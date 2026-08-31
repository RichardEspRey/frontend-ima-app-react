import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { post, postLista, construirFormData } from "../client"
import { ApiError, CAUSA_ERROR } from "../errors"
import { ENDPOINTS } from "../endpoints"

const responder = (cuerpo, { ok = true, status = 200 } = {}) =>
  vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      text: () => Promise.resolve(typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo)),
    }),
  )

const camposDe = (fd) => Object.fromEntries(fd.entries())

beforeEach(() => vi.useRealTimers())
afterEach(() => vi.restoreAllMocks())

describe("construirFormData", () => {
  it("siempre incluye op", () => {
    expect(camposDe(construirFormData("getAll")).op).toBe("getAll")
  })

  it("omite undefined y null en vez de mandarlos como texto", () => {
    const campos = camposDe(
      construirFormData("add", { nombre: "Ana", puesto: undefined, sueldo: null }),
    )
    expect(campos.nombre).toBe("Ana")
    expect(campos).not.toHaveProperty("puesto")
    expect(campos).not.toHaveProperty("sueldo")
  })

  it("manda los booleanos como 1 y 0", () => {
    const campos = camposDe(construirFormData("x", { activo: true, borrado: false }))
    expect(campos.activo).toBe("1")
    expect(campos.borrado).toBe("0")
  })

  it("serializa objetos y arreglos como JSON", () => {
    const campos = camposDe(construirFormData("x", { etapas: [1, 2] }))
    expect(campos.etapas).toBe("[1,2]")
  })

  it("deja pasar los File tal cual, sin convertirlos a texto", () => {
    const archivo = new File(["contenido"], "doc.pdf", { type: "application/pdf" })
    const fd = construirFormData("upload", { documento: archivo })
    expect(fd.get("documento")).toBeInstanceOf(File)
  })
})

describe("post", () => {
  it("devuelve el cuerpo cuando la API responde success", async () => {
    global.fetch = responder({ status: "success", data: [{ id: 1 }] })
    const cuerpo = await post(ENDPOINTS.personalAdmin, "getAll")
    expect(cuerpo.data).toEqual([{ id: 1 }])
  })

  it("llama al endpoint correcto por POST", async () => {
    global.fetch = responder({ status: "success" })
    await post(ENDPOINTS.personalAdmin, "getAll")
    const [url, opciones] = global.fetch.mock.calls[0]
    expect(url).toContain("personal_admin.php")
    expect(opciones.method).toBe("POST")
  })

  it("convierte status:'error' en ApiError, aunque el HTTP sea 200", async () => {
    global.fetch = responder({ status: "error", message: "Ese empleado ya existe" })
    await expect(post(ENDPOINTS.personalAdmin, "add")).rejects.toMatchObject({
      name: "ApiError",
      causa: CAUSA_ERROR.NEGOCIO,
      message: "Ese empleado ya existe",
    })
  })

  it("marca los errores de negocio como no reintentables", async () => {
    global.fetch = responder({ status: "error", message: "no" })
    const error = await post(ENDPOINTS.personalAdmin, "add").catch((e) => e)
    expect(error.esReintentable).toBe(false)
  })

  it("marca los fallos de red como reintentables", async () => {
    global.fetch = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")))
    const error = await post(ENDPOINTS.personalAdmin, "getAll").catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.causa).toBe(CAUSA_ERROR.RED)
    expect(error.esReintentable).toBe(true)
  })

  it("falla con causa HTTP cuando el status no es 2xx", async () => {
    global.fetch = responder("Internal Server Error", { ok: false, status: 500 })
    const error = await post(ENDPOINTS.personalAdmin, "getAll").catch((e) => e)
    expect(error.causa).toBe(CAUSA_ERROR.HTTP)
    expect(error.detalle).toBe(500)
  })

  it("falla con causa RESPUESTA_INVALIDA si el cuerpo no es JSON", async () => {
    global.fetch = responder("<br><b>Warning</b>: mysqli error en la línea 12")
    const error = await post(ENDPOINTS.personalAdmin, "getAll").catch((e) => e)
    expect(error.causa).toBe(CAUSA_ERROR.RESPUESTA_INVALIDA)
    expect(error.detalle).toContain("Warning")
  })

  it("aborta por tiempo agotado", async () => {
    global.fetch = vi.fn((_url, { signal }) =>
      new Promise((_resolver, rechazar) => {
        signal.addEventListener("abort", () => rechazar(new DOMException("Aborted", "AbortError")))
      }),
    )
    const error = await post(ENDPOINTS.personalAdmin, "getAll", {}, { timeoutMs: 10 })
      .catch((e) => e)
    expect(error.causa).toBe(CAUSA_ERROR.TIEMPO_AGOTADO)
    expect(error.esReintentable).toBe(true)
  })

  it("conserva el endpoint y la op en el error, para el log", async () => {
    global.fetch = responder({ status: "error", message: "falló" })
    const error = await post(ENDPOINTS.gastos, "deleteExpense").catch((e) => e)
    expect(error.endpoint).toBe("save_expense.php")
    expect(error.op).toBe("deleteExpense")
    expect(String(error)).toContain("save_expense.php#deleteExpense")
  })
})

describe("postLista", () => {
  it("devuelve el arreglo del campo indicado", async () => {
    global.fetch = responder({ status: "success", data: [{ id: 1 }, { id: 2 }] })
    expect(await postLista(ENDPOINTS.personalAdmin, "getAll")).toHaveLength(2)
  })

  it("devuelve [] cuando la clave no viene, en vez de undefined", async () => {
    global.fetch = responder({ status: "success" })
    expect(await postLista(ENDPOINTS.personalAdmin, "getAll")).toEqual([])
  })

  it("devuelve [] cuando la clave viene pero no es un arreglo", async () => {
    global.fetch = responder({ status: "success", data: null })
    expect(await postLista(ENDPOINTS.personalAdmin, "getAll")).toEqual([])
  })

  it("permite leer una clave distinta de data", async () => {
    global.fetch = responder({ status: "success", users: [{ id: 9 }] })
    const lista = await postLista(ENDPOINTS.features, "get_users", { campo: "users" })
    expect(lista).toEqual([{ id: 9 }])
  })

  it("propaga el ApiError de negocio", async () => {
    global.fetch = responder({ status: "error", message: "sin permisos" })
    await expect(postLista(ENDPOINTS.features, "get_users")).rejects.toThrow("sin permisos")
  })
})
