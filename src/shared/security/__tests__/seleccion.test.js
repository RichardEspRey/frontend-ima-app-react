import { describe, it, expect, vi, beforeEach } from "vitest"
import { archivosDelEvento, archivoDelEvento } from "../seleccion"
import { GRUPOS_ARCHIVO } from "../archivos"
import { notify } from "../../ui/notify"

vi.mock("../../ui/notify", () => ({
  notify: { error: vi.fn() },
}))

const FIRMAS = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34],
  jpg: [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46],
  exe: [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00],
}

/**
 * Arma un `File` con la firma binaria de un tipo real.
 *
 * @param {string} nombre Nombre del archivo, con su extensión.
 * @param {string} firma Clave de `FIRMAS`.
 * @returns {File} El archivo de prueba.
 */
function archivo(nombre, firma) {
  return new File([new Uint8Array([...FIRMAS[firma], ...new Array(100).fill(0x41)])], nombre)
}

/**
 * Simula el `change` de un `<input type="file">`, con su `value` para poder
 * comprobar que se limpia.
 *
 * @param {Array.<File>} archivos Los archivos elegidos.
 * @returns {object} El evento simulado.
 */
function evento(archivos) {
  return { target: { files: archivos, value: "C:\\falso\\ruta.pdf" } }
}

beforeEach(() => vi.clearAllMocks())

describe("archivosDelEvento", () => {
  it("devuelve los archivos que pasan la validación", async () => {
    const aceptados = await archivosDelEvento(evento([archivo("factura.pdf", "pdf")]))

    expect(aceptados).toHaveLength(1)
    expect(aceptados[0].name).toBe("factura.pdf")
  })

  it("deja fuera el ejecutable disfrazado de PDF", async () => {
    const aceptados = await archivosDelEvento(evento([archivo("virus.pdf", "exe")]))

    expect(aceptados).toEqual([])
    expect(notify.error).toHaveBeenCalled()
  })

  it("acepta los buenos y descarta los malos en la misma selección", async () => {
    const aceptados = await archivosDelEvento(
      evento([archivo("bueno.pdf", "pdf"), archivo("malo.pdf", "exe")]),
    )

    expect(aceptados.map((a) => a.name)).toEqual(["bueno.pdf"])
  })

  it("respeta el grupo que se le pide", async () => {
    const soloPdf = await archivosDelEvento(evento([archivo("foto.jpg", "jpg")]), {
      grupo: GRUPOS_ARCHIVO.SOLO_PDF,
    })
    expect(soloPdf).toEqual([])

    const imagen = await archivosDelEvento(evento([archivo("foto.jpg", "jpg")]), {
      grupo: GRUPOS_ARCHIVO.IMAGEN,
    })
    expect(imagen).toHaveLength(1)
  })

  it("limpia el valor del input, para que reelegir el mismo archivo vuelva a disparar el change", async () => {
    const e = evento([archivo("factura.pdf", "pdf")])
    await archivosDelEvento(e)

    expect(e.target.value).toBe("")
  })

  it("no avisa si se le pide callar", async () => {
    await archivosDelEvento(evento([archivo("virus.pdf", "exe")]), { avisar: false })

    expect(notify.error).not.toHaveBeenCalled()
  })

  it("nombra el archivo rechazado en el aviso", async () => {
    await archivosDelEvento(evento([archivo("virus.pdf", "exe")]))

    expect(notify.error.mock.calls[0][0]).toContain("virus.pdf")
  })

  it("cuenta los rechazados cuando son varios", async () => {
    await archivosDelEvento(evento([archivo("a.pdf", "exe"), archivo("b.pdf", "exe")]))

    expect(notify.error.mock.calls[0][0]).toContain("2 archivos")
  })

  it("una selección vacía no avisa ni revienta", async () => {
    expect(await archivosDelEvento(evento([]))).toEqual([])
    expect(await archivosDelEvento({})).toEqual([])
    expect(await archivosDelEvento(null)).toEqual([])
    expect(notify.error).not.toHaveBeenCalled()
  })
})

describe("archivoDelEvento", () => {
  it("devuelve el archivo cuando pasa", async () => {
    const uno = await archivoDelEvento(evento([archivo("factura.pdf", "pdf")]))

    expect(uno.name).toBe("factura.pdf")
  })

  it("devuelve null cuando no pasa, para que el llamador pueda cortar", async () => {
    expect(await archivoDelEvento(evento([archivo("virus.pdf", "exe")]))).toBeNull()
  })

  it("devuelve null si no se eligió nada", async () => {
    expect(await archivoDelEvento(evento([]))).toBeNull()
  })
})
