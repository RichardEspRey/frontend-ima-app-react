import { describe, it, expect } from "vitest"
import {
  validarArchivo,
  validarArchivos,
  atributoAccept,
  pesoLegible,
  GRUPOS_ARCHIVO,
  TAMANO_MAXIMO_BYTES,
} from "../archivos"

const FIRMAS = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34],
  jpg: [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  exe: [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00],
}

/**
 * Arma un `File` con la firma binaria de un tipo real.
 *
 * @param {string} nombre Nombre del archivo, con su extensión.
 * @param {string} firma Clave de `FIRMAS`.
 * @param {number} [relleno=100] Bytes extra después de la firma.
 * @returns {File} El archivo de prueba.
 */
function archivo(nombre, firma, relleno = 100) {
  const bytes = new Uint8Array([...FIRMAS[firma], ...new Array(relleno).fill(0x41)])
  return new File([bytes], nombre)
}

describe("validarArchivo", () => {
  it("acepta un PDF de verdad", async () => {
    const r = await validarArchivo(archivo("factura.pdf", "pdf"), {
      grupo: GRUPOS_ARCHIVO.SOLO_PDF,
    })
    expect(r).toEqual({ valido: true, tipo: "pdf" })
  })

  it("acepta jpg y png donde se piden imágenes", async () => {
    expect((await validarArchivo(archivo("t.jpg", "jpg"), { grupo: GRUPOS_ARCHIVO.IMAGEN })).valido).toBe(true)
    expect((await validarArchivo(archivo("t.png", "png"), { grupo: GRUPOS_ARCHIVO.IMAGEN })).valido).toBe(true)
  })

  it("rechaza un ejecutable renombrado a .pdf, que es lo que la extensión no ve", async () => {
    const r = await validarArchivo(archivo("factura.pdf", "exe"), {
      grupo: GRUPOS_ARCHIVO.SOLO_PDF,
    })
    expect(r.valido).toBe(false)
    expect(r.motivo).toMatch(/su contenido no lo es/)
  })

  it("rechaza un tipo que no está en el grupo pedido", async () => {
    const r = await validarArchivo(archivo("foto.png", "png"), {
      grupo: GRUPOS_ARCHIVO.SOLO_PDF,
    })
    expect(r.valido).toBe(false)
    expect(r.motivo).toBe("Solo se aceptan archivos PDF.")
  })

  it("rechaza el archivo vacío", async () => {
    const r = await validarArchivo(new File([], "vacio.pdf"))
    expect(r.valido).toBe(false)
    expect(r.motivo).toBe("El archivo está vacío.")
  })

  it("rechaza lo que pasa del máximo y dice cuánto pesa", async () => {
    const grande = new File(
      [new Uint8Array(TAMANO_MAXIMO_BYTES + 1024)],
      "grande.pdf",
    )
    const r = await validarArchivo(grande)
    expect(r.valido).toBe(false)
    expect(r.motivo).toMatch(/el máximo es 10\.0 MB/)
  })

  it("rechaza lo que no es un archivo", async () => {
    expect((await validarArchivo(null)).valido).toBe(false)
    expect((await validarArchivo("factura.pdf")).valido).toBe(false)
  })

  it("no distingue mayúsculas en la extensión", async () => {
    expect((await validarArchivo(archivo("FACTURA.PDF", "pdf"))).valido).toBe(true)
  })
})

describe("validarArchivos", () => {
  it("separa los buenos de los malos en vez de tirar todo", async () => {
    const { aceptados, rechazados } = await validarArchivos(
      [archivo("a.pdf", "pdf"), archivo("b.pdf", "exe"), archivo("c.pdf", "pdf")],
      { grupo: GRUPOS_ARCHIVO.SOLO_PDF },
    )
    expect(aceptados.map((a) => a.name)).toEqual(["a.pdf", "c.pdf"])
    expect(rechazados).toHaveLength(1)
    expect(rechazados[0].archivo.name).toBe("b.pdf")
  })
})

describe("atributoAccept", () => {
  it("sale de la misma tabla que valida", () => {
    expect(atributoAccept(GRUPOS_ARCHIVO.SOLO_PDF)).toBe(".pdf")
    expect(atributoAccept(GRUPOS_ARCHIVO.DOCUMENTO)).toBe(".pdf,.jpg,.jpeg,.png")
  })
})

describe("pesoLegible", () => {
  it("elige la unidad según el tamaño", () => {
    expect(pesoLegible(512)).toBe("512 B")
    expect(pesoLegible(2048)).toBe("2 KB")
    expect(pesoLegible(5 * 1024 * 1024)).toBe("5.0 MB")
  })

  it("no revienta con basura", () => {
    expect(pesoLegible(NaN)).toBe("0 KB")
    expect(pesoLegible(-1)).toBe("0 KB")
  })
})
