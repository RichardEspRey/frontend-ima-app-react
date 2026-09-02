import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { IdiomaProvider, useIdioma } from "../IdiomaContext"
import { IDIOMA, esIdiomaValido, CLAVE_ALMACEN } from "../idiomas"
import { TEXTOS, clavesFaltantes } from "../textos"

/**
 * Un componente que enseña una traducción y deja cambiar el idioma.
 *
 * @returns {object} El componente de prueba.
 */
function Muestra() {
  const { t, idioma, cambiarIdioma } = useIdioma()
  return (
    <div>
      <p data-testid="texto">{t("tabla.camion")}</p>
      <p data-testid="idioma">{idioma}</p>
      <button onClick={() => cambiarIdioma(IDIOMA.EN)}>en</button>
      <button onClick={() => cambiarIdioma("klingon")}>invalido</button>
    </div>
  )
}

beforeEach(() => window.localStorage.clear())

describe("catálogo de textos", () => {
  it("los dos idiomas tienen exactamente las mismas claves", () => {
    // Es la prueba que impide las pantallas mitad traducidas: si alguien agrega
    // un texto en español y olvida el inglés, esto falla antes de llegar a nadie.
    expect(clavesFaltantes(IDIOMA.EN)).toEqual([])
    expect(clavesFaltantes(IDIOMA.ES)).toEqual([])
  })

  it("ningún texto se quedó vacío", () => {
    for (const [idioma, catalogo] of Object.entries(TEXTOS)) {
      for (const [clave, valor] of Object.entries(catalogo)) {
        expect(valor, `${idioma} · ${clave}`).toBeTruthy()
      }
    }
  })

  it("Trip y Driver dicen lo mismo en los dos: son términos del oficio", () => {
    expect(TEXTOS[IDIOMA.EN]["tabla.trip"]).toBe(TEXTOS[IDIOMA.ES]["tabla.trip"])
    expect(TEXTOS[IDIOMA.EN]["tabla.driver"]).toBe(TEXTOS[IDIOMA.ES]["tabla.driver"])
  })
})

describe("useIdioma", () => {
  it("arranca en español", () => {
    render(
      <IdiomaProvider>
        <Muestra />
      </IdiomaProvider>,
    )
    expect(screen.getByTestId("texto")).toHaveTextContent("Camión")
  })

  it("cambia los textos al cambiar de idioma", async () => {
    render(
      <IdiomaProvider>
        <Muestra />
      </IdiomaProvider>,
    )

    await userEvent.click(screen.getByRole("button", { name: "en" }))

    expect(screen.getByTestId("texto")).toHaveTextContent("Truck")
    expect(screen.getByTestId("idioma")).toHaveTextContent("en")
  })

  it("recuerda la preferencia", async () => {
    render(
      <IdiomaProvider>
        <Muestra />
      </IdiomaProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "en" }))

    expect(window.localStorage.getItem(CLAVE_ALMACEN)).toBe("en")
  })

  it("ignora un idioma guardado que ya no existe", () => {
    window.localStorage.setItem(CLAVE_ALMACEN, "klingon")
    render(
      <IdiomaProvider>
        <Muestra />
      </IdiomaProvider>,
    )

    // Sin esta guarda la interfaz se quedaría sin textos.
    expect(screen.getByTestId("idioma")).toHaveTextContent("es")
  })

  it("ignora un cambio a un idioma que no existe", async () => {
    render(
      <IdiomaProvider>
        <Muestra />
      </IdiomaProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "invalido" }))

    expect(screen.getByTestId("idioma")).toHaveTextContent("es")
  })

  it("devuelve la clave cuando el texto no existe, para que se vea el hueco", () => {
    /**
     * Pide un texto que no está en el catálogo.
     *
     * @returns {object} El texto ausente.
     */
    const Falta = () => {
      const { t } = useIdioma()
      return <p>{t("no.existe")}</p>
    }

    render(
      <IdiomaProvider>
        <Falta />
      </IdiomaProvider>,
    )

    expect(screen.getByText("no.existe")).toBeInTheDocument()
  })

  it("no revienta si el navegador bloquea el almacenamiento", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado")
    })

    expect(() =>
      render(
        <IdiomaProvider>
          <Muestra />
        </IdiomaProvider>,
      ),
    ).not.toThrow()

    vi.restoreAllMocks()
  })
})

describe("esIdiomaValido", () => {
  it("acepta los que existen y rechaza el resto", () => {
    expect(esIdiomaValido("es")).toBe(true)
    expect(esIdiomaValido("en")).toBe(true)
    expect(esIdiomaValido("fr")).toBe(false)
    expect(esIdiomaValido(null)).toBe(false)
  })
})
