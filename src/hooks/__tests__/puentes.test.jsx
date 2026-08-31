import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryProvider } from "../../app/providers/QueryProvider"
import useFetchCompanies from "../useFetchCompanies"
import useFetchActiveDrivers from "../useFetchActiveDrivers"

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

function Consumidor({ onRender }) {
  const { activeCompanies, loading } = useFetchCompanies()
  onRender?.(activeCompanies)
  return <div data-testid="estado">{loading ? "cargando" : `${activeCompanies.length}`}</div>
}

beforeEach(() => {
  global.fetch = responder({
    status: "success",
    companies: [{ company_id: "1", nombre_compania: "IMA" }],
  })
})

describe("puentes de catálogo", () => {
  it("conserva la forma { activeCompanies, loading, error, refetchCompanies }", async () => {
    let capturado
    function Sonda() {
      capturado = useFetchCompanies()
      return null
    }
    render(<QueryProvider><Sonda /></QueryProvider>)
    await waitFor(() => expect(capturado.loading).toBe(false))

    expect(capturado).toHaveProperty("activeCompanies")
    expect(capturado).toHaveProperty("loading")
    expect(capturado).toHaveProperty("error")
    expect(typeof capturado.refetchCompanies).toBe("function")
  })

  it("devuelve [] mientras carga, nunca undefined", () => {
    let capturado
    function Sonda() {
      capturado = useFetchCompanies()
      return null
    }
    render(<QueryProvider><Sonda /></QueryProvider>)
    expect(capturado.activeCompanies).toEqual([])
  })

  it("tres consumidores del mismo catálogo hacen UNA sola petición", async () => {
    render(
      <QueryProvider>
        <Consumidor />
        <Consumidor />
        <Consumidor />
      </QueryProvider>,
    )
    await waitFor(() => {
      expect(screen.getAllByTestId("estado")[0]).toHaveTextContent("1")
    })
    expect(peticionesA("companies.php")).toBe(1)
  })

  it("mantiene la identidad del arreglo si los datos no cambiaron", async () => {
    const vistas = []
    const { rerender } = render(
      <QueryProvider>
        <Consumidor onRender={(lista) => vistas.push(lista)} />
      </QueryProvider>,
    )
    await waitFor(() => expect(vistas.at(-1)).toHaveLength(1))

    const trasCargar = vistas.at(-1)
    rerender(
      <QueryProvider>
        <Consumidor onRender={(lista) => vistas.push(lista)} />
      </QueryProvider>,
    )

    expect(Object.is(vistas.at(-1), trasCargar)).toBe(true)
  })

  it("cambia la identidad SOLO al pasar de cargando a cargado", async () => {
    const vistas = []
    render(
      <QueryProvider>
        <Consumidor onRender={(lista) => vistas.push(lista)} />
      </QueryProvider>,
    )
    await waitFor(() => expect(vistas.at(-1)).toHaveLength(1))

    const identidades = new Set(vistas)
    expect(identidades.size).toBe(2)
  })

  it("proyecta solo los campos que proyectaba el hook original", async () => {
    global.fetch = responder({
      status: "success",
      drivers: [
        { driver_id: "7", nombre: "Ana", telefono: "555", curp: "XXXX", sueldo: "9999" },
      ],
    })
    let capturado
    function Sonda() {
      capturado = useFetchActiveDrivers()
      return null
    }
    render(<QueryProvider><Sonda /></QueryProvider>)
    await waitFor(() => expect(capturado.activeDrivers).toHaveLength(1))

    expect(Object.keys(capturado.activeDrivers[0]).sort()).toEqual(["driver_id", "nombre"])
  })

  it("expone el mensaje de error como cadena, no como objeto", async () => {
    global.fetch = responder({ status: "error", message: "sin permisos" })
    let capturado
    function Sonda() {
      capturado = useFetchCompanies()
      return null
    }
    render(<QueryProvider><Sonda /></QueryProvider>)
    await waitFor(() => expect(capturado.error).toBeTruthy())

    expect(capturado.error).toBe("sin permisos")
    expect(capturado.activeCompanies).toEqual([])
  })
})
