import { describe, it, expect } from "vitest"
import { limpiarTexto, tieneInvisibles, limpiarProfundo, LARGO_MAXIMO } from "../texto"

describe("limpiarTexto", () => {
  it("recorta los extremos", () => {
    expect(limpiarTexto("   Nuevo Laredo   ")).toBe("Nuevo Laredo")
  })

  it("quita los caracteres de ancho cero que se cuelan al pegar", () => {
    expect(limpiarTexto("Nuevo\u200BLaredo")).toBe("NuevoLaredo")
    expect(limpiarTexto("\uFEFFDallas")).toBe("Dallas")
  })

  it("quita los caracteres de control", () => {
    expect(limpiarTexto("Dal\u0000las")).toBe("Dallas")
    expect(limpiarTexto("Dal\u001Blas")).toBe("Dallas")
  })

  it("conserva el tabulador y el salto de línea, que sí son legítimos", () => {
    expect(limpiarTexto("uno\tdos", LARGO_MAXIMO.NOTA)).toBe("uno\tdos")
    expect(limpiarTexto("uno\ndos", LARGO_MAXIMO.NOTA)).toBe("uno\ndos")
  })

  it("colapsa los saltos de línea de más", () => {
    expect(limpiarTexto("uno\n\n\n\n\ndos", LARGO_MAXIMO.NOTA)).toBe("uno\n\ndos")
  })

  it("normaliza a NFC para que dos textos iguales sean la misma cadena", () => {
    const compuesto = "Jose\u0301"
    const precompuesto = "José"
    expect(limpiarTexto(compuesto)).toBe(limpiarTexto(precompuesto))
  })

  it("corta al largo máximo", () => {
    expect(limpiarTexto("a".repeat(500), LARGO_MAXIMO.CORTO)).toHaveLength(100)
  })

  it("NO escapa comillas: rompería apellidos legítimos", () => {
    expect(limpiarTexto("O'Brien")).toBe("O'Brien")
    expect(limpiarTexto('Carga "frágil"')).toBe('Carga "frágil"')
  })

  it("NO censura palabras de SQL: una nota puede mencionarlas", () => {
    expect(limpiarTexto("Hay que hacer un select de los viajes")).toBe(
      "Hay que hacer un select de los viajes",
    )
    expect(limpiarTexto("DROP TABLE viajes")).toBe("DROP TABLE viajes")
  })

  it("devuelve cadena vacía si no es texto", () => {
    expect(limpiarTexto(null)).toBe("")
    expect(limpiarTexto(42)).toBe("")
    expect(limpiarTexto(undefined)).toBe("")
  })
})

describe("tieneInvisibles", () => {
  it("detecta lo que no se ve", () => {
    expect(tieneInvisibles("Nuevo\u200BLaredo")).toBe(true)
    expect(tieneInvisibles("Dal\u0000las")).toBe(true)
  })

  it("no marca un texto normal", () => {
    expect(tieneInvisibles("Nuevo Laredo")).toBe(false)
    expect(tieneInvisibles("uno\ndos")).toBe(false)
    expect(tieneInvisibles(null)).toBe(false)
  })

  it("da el mismo resultado si se le llama dos veces seguidas", () => {
    const texto = "Nuevo\u200BLaredo"
    expect(tieneInvisibles(texto)).toBe(true)
    expect(tieneInvisibles(texto)).toBe(true)
  })
})

describe("limpiarProfundo", () => {
  it("limpia los textos y deja el resto igual", () => {
    expect(
      limpiarProfundo({
        nombre: "  Nuevo\u200BLaredo  ",
        millas: 428.7,
        activo: true,
        sin_dato: null,
      }),
    ).toEqual({
      nombre: "NuevoLaredo",
      millas: 428.7,
      activo: true,
      sin_dato: null,
    })
  })

  it("baja por objetos y arreglos anidados", () => {
    expect(limpiarProfundo({ paradas: [{ ciudad: " Dallas " }] })).toEqual({
      paradas: [{ ciudad: "Dallas" }],
    })
  })

  it("no toca los archivos, que la capa de API sabe serializar", () => {
    const pdf = new File([new Uint8Array([1, 2, 3])], "factura.pdf")
    const salida = limpiarProfundo({ archivo: pdf, nota: " x " })
    expect(salida.archivo).toBe(pdf)
    expect(salida.nota).toBe("x")
  })
})
