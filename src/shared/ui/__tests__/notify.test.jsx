import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AnfitrionAvisos } from "../avisos/AnfitrionAvisos"
import { reiniciar } from "../avisos/cola"
import { notify } from "../notify"

function montar() {
  render(<AnfitrionAvisos />)
}

/**
 * Llama a `notify` dentro de `act`, que es lo que React pide para un cambio de
 * estado disparado desde fuera de un componente.
 *
 * @param {Function} llamada La llamada a `notify` a ejecutar.
 * @returns {Promise} Lo que devuelva esa llamada.
 */
function lanzar(llamada) {
  let respuesta
  act(() => { respuesta = llamada() })
  return respuesta
}

beforeEach(() => act(() => reiniciar()))
afterEach(() => {
  act(() => reiniciar())
  vi.useRealTimers()
})

describe("notify · los avisos de un botón", () => {
  it("exito muestra el título y el mensaje", async () => {
    montar()
    lanzar(() => notify.exito("Guardado"))

    expect(await screen.findByText("Listo")).toBeInTheDocument()
    expect(screen.getByText("Guardado")).toBeInTheDocument()
  })

  it("la promesa espera a que la persona cierre", async () => {
    montar()
    let cerrado = false
    lanzar(() => notify.exito("Guardado").then(() => { cerrado = true }))

    await screen.findByText("Guardado")
    expect(cerrado).toBe(false)

    await userEvent.click(screen.getByRole("button", { name: "Entendido" }))
    await waitFor(() => expect(cerrado).toBe(true))
  })

  it("error acepta un Error y saca su mensaje", async () => {
    montar()
    lanzar(() => notify.error(new Error("Sin conexión")))

    expect(await screen.findByText("Sin conexión")).toBeInTheDocument()
    expect(screen.getByText("No se pudo completar")).toBeInTheDocument()
  })

  it("aviso lleva su propio título", async () => {
    montar()
    lanzar(() => notify.aviso("Falta el nombre"))

    expect(await screen.findByText("Atención")).toBeInTheDocument()
    expect(screen.getByText("Falta el nombre")).toBeInTheDocument()
  })

  it("conDetalle enumera los puntos", async () => {
    montar()
    lanzar(() => notify.conDetalle({ lista: ["ID 12: falta la fecha", "ID 15: falta el destino"] }))

    expect(await screen.findByText("ID 12: falta la fecha")).toBeInTheDocument()
    expect(screen.getByText("ID 15: falta el destino")).toBeInTheDocument()
  })

  it("un detalle que viene del servidor se escapa, no se interpreta", async () => {
    montar()
    lanzar(() => notify.conDetalle({ lista: ["<img src=x onerror=alert(1)>"] }))

    expect(await screen.findByText("<img src=x onerror=alert(1)>")).toBeInTheDocument()
    expect(document.querySelector("img")).toBeNull()
  })

  it("el resumen muestra los renglones y su total", async () => {
    montar()
    lanzar(() => notify.confirmar({
      titulo: "¿Autorizar Pago?",
      detalle: {
        renglones: [{ etiqueta: "Tarifa", valor: "$2.10" }],
        total: { etiqueta: "Total", valor: "$1,240.00" },
      },
    }))

    expect(await screen.findByText("Tarifa")).toBeInTheDocument()
    expect(screen.getByText("$2.10")).toBeInTheDocument()
    expect(screen.getByText("$1,240.00")).toBeInTheDocument()
  })
})

describe("notify.confirmar", () => {
  it("devuelve un booleano, no el objeto de una librería", async () => {
    montar()
    const respuesta = lanzar(() => notify.confirmar({ titulo: "¿Seguro?" }))

    await userEvent.click(await screen.findByRole("button", { name: "Sí, continuar" }))
    await expect(respuesta).resolves.toBe(true)
  })

  it("cancelar devuelve false", async () => {
    montar()
    const respuesta = lanzar(() => notify.confirmar({ titulo: "¿Seguro?" }))

    await userEvent.click(await screen.findByRole("button", { name: "Cancelar" }))
    await expect(respuesta).resolves.toBe(false)
  })

  it("cerrar con Escape cuenta como no aceptar", async () => {
    montar()
    const respuesta = lanzar(() => notify.confirmar({ titulo: "¿Seguro?" }))

    await screen.findByText("¿Seguro?")
    await userEvent.keyboard("{Escape}")
    await expect(respuesta).resolves.toBe(false)
  })

  it("pinta de rojo el botón por omisión, por ser destructivo", async () => {
    montar()
    lanzar(() => notify.confirmar({ titulo: "¿Borrar?" }))

    const boton = await screen.findByRole("button", { name: "Sí, continuar" })
    expect(boton.className).toMatch(/colorError|containedError/)
  })

  it("permite quitar el rojo cuando la acción no destruye nada", async () => {
    montar()
    lanzar(() => notify.confirmar({ titulo: "¿Autorizar?", peligroso: false }))

    const boton = await screen.findByRole("button", { name: "Sí, continuar" })
    expect(boton.className).not.toMatch(/colorError|containedError/)
  })

  it("respeta los textos de los botones", async () => {
    montar()
    lanzar(() => notify.confirmar({ titulo: "¿Finalizar?", confirmar: "Sí, finalizar", cancelar: "Ahora no" }))

    expect(await screen.findByRole("button", { name: "Sí, finalizar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ahora no" })).toBeInTheDocument()
  })
})

describe("notify.elegir", () => {
  it("devuelve el valor de la opción elegida", async () => {
    montar()
    const respuesta = lanzar(() => notify.elegir({
      titulo: "¿Para quién?",
      opciones: [
        { valor: "admin", texto: "Administrativos" },
        { valor: "operador", texto: "Operadores" },
      ],
    }))

    await userEvent.click(await screen.findByRole("button", { name: "Operadores" }))
    await expect(respuesta).resolves.toBe("operador")
  })

  it("cancelar devuelve null", async () => {
    montar()
    const respuesta = lanzar(() => notify.elegir({
      titulo: "¿Para quién?",
      opciones: [
        { valor: "admin", texto: "Administrativos" },
        { valor: "operador", texto: "Operadores" },
      ],
    }))

    await userEvent.click(await screen.findByRole("button", { name: "Cancelar" }))
    await expect(respuesta).resolves.toBeNull()
  })
})

describe("notify.cargando", () => {
  it("bloquea con el texto de lo que está pasando", async () => {
    montar()
    lanzar(() => notify.cargando())

    expect(await screen.findByText("Guardando…")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("cualquier aviso posterior lo releva, sin tener que cerrarlo a mano", async () => {
    montar()
    lanzar(() => notify.cargando())
    await screen.findByText("Guardando…")

    lanzar(() => notify.exito("Viaje guardado"))

    expect(await screen.findByText("Viaje guardado")).toBeInTheDocument()
    expect(screen.queryByText("Guardando…")).not.toBeInTheDocument()
  })

  it("cerrar lo quita", async () => {
    montar()
    lanzar(() => notify.cargando())
    await screen.findByText("Guardando…")

    lanzar(() => notify.cerrar())
    await waitFor(() => expect(screen.queryByText("Guardando…")).not.toBeInTheDocument())
  })
})

describe("notify.discreto", () => {
  it("no trae botón de aceptar: no interrumpe", async () => {
    montar()
    lanzar(() => notify.discreto("No se pudo conectar con el servidor."))

    expect(await screen.findByText("No se pudo conectar con el servidor.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Entendido" })).not.toBeInTheDocument()
  })

  it("acepta un Error y saca su mensaje", async () => {
    montar()
    lanzar(() => notify.discreto(new Error("se cayó la red")))

    expect(await screen.findByText("se cayó la red")).toBeInTheDocument()
  })

  it("respeta la severidad que se le pide, no una variable inexistente", async () => {
    montar()
    lanzar(() => notify.discreto("algo", "warning"))

    const alerta = await screen.findByRole("alert")
    expect(alerta.className).toMatch(/Warning/)
  })

  it("varios avisos conviven en vez de taparse", async () => {
    montar()
    lanzar(() => notify.discreto("primero"))
    lanzar(() => notify.discreto("segundo"))

    expect(await screen.findByText("primero")).toBeInTheDocument()
    expect(screen.getByText("segundo")).toBeInTheDocument()
  })

  it("desaparece solo", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    montar()
    lanzar(() => notify.discreto("se va solo"))

    await screen.findByText("se va solo")
    vi.advanceTimersByTime(6000)

    await waitFor(() => expect(screen.queryByText("se va solo")).not.toBeInTheDocument())
  })
})

describe("la cola", () => {
  it("no pierde el segundo aviso: lo muestra después del primero", async () => {
    montar()
    lanzar(() => notify.exito("primero"))
    lanzar(() => notify.exito("segundo"))

    await screen.findByText("primero")
    expect(screen.queryByText("segundo")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Entendido" }))
    expect(await screen.findByText("segundo")).toBeInTheDocument()
  })
})
