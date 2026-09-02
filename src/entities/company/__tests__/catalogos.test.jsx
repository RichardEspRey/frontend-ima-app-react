import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { QueryProvider } from "../../../app/providers/QueryProvider"
import { useCompanias } from "../api/companias"

const responder = (cuerpo) =>
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(cuerpo)),
    }),
  )

const peticionesA = (archivo) =>
  global.fetch.mock.calls.filter(([url]) => url.includes(archivo)).length

/**
 * Renderiza el hook y deja ver cada valor que devolvió.
 *
 * @param {object} props Propiedades del componente.
 * @param {Function} props.onRender Recibe la lista en cada pintado.
 * @returns {null} No dibuja nada.
 */
function Sonda({ onRender }) {
  const { data } = useCompanias()
  onRender(data)
  return null
}

beforeEach(() => {
  global.fetch = responder({
    status: "success",
    companies: [{ company_id: "1", nombre_compania: "IMA" }],
  })
})

describe("los catálogos como entidad", () => {
  it("varios consumidores del mismo catálogo hacen UNA sola petición", async () => {
    const vistas = []
    render(
      <QueryProvider>
        <Sonda onRender={(l) => vistas.push(l)} />
        <Sonda onRender={(l) => vistas.push(l)} />
        <Sonda onRender={(l) => vistas.push(l)} />
      </QueryProvider>,
    )

    await waitFor(() => expect(vistas.at(-1)).toHaveLength(1))
    expect(peticionesA("companies.php")).toBe(1)
  })

  it("la lista conserva su identidad entre pintados", async () => {
    const vistas = []
    const { rerender } = render(
      <QueryProvider>
        <Sonda onRender={(l) => vistas.push(l)} />
      </QueryProvider>,
    )
    await waitFor(() => expect(vistas.at(-1)).toHaveLength(1))

    const cargada = vistas.at(-1)
    rerender(
      <QueryProvider>
        <Sonda onRender={(l) => vistas.push(l)} />
      </QueryProvider>,
    )

    expect(Object.is(vistas.at(-1), cargada)).toBe(true)
  })

  it("mientras carga devuelve undefined, y la pantalla pone su propio vacío", async () => {
    const vistas = []
    render(
      <QueryProvider>
        <Sonda onRender={(l) => vistas.push(l)} />
      </QueryProvider>,
    )
    expect(vistas[0]).toBeUndefined()
    await waitFor(() => expect(vistas.at(-1)).toHaveLength(1))
  })

  it("un error de negocio deja la lista sin datos en vez de a medias", async () => {
    global.fetch = responder({ status: "error", message: "sin permisos" })
    const vistas = []
    render(
      <QueryProvider>
        <Sonda onRender={(l) => vistas.push(l)} />
      </QueryProvider>,
    )
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(vistas.every((v) => v === undefined)).toBe(true)
  })
})
