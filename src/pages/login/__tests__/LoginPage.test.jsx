import { describe, it, expect, beforeEach, vi } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import LoginPage from "../LoginPage"
import { renderPantalla, sinSesion, opsLlamadas } from "../../../test/utils"

const escribirCredenciales = () => {
  fireEvent.change(screen.getByPlaceholderText("Usuario"), { target: { value: "ana" } })
  fireEvent.change(screen.getByPlaceholderText("Contraseña"), { target: { value: "secreta" } })
}

describe("LoginPage", () => {
  beforeEach(() => {
    sinSesion()
  })

  it("dibuja el formulario", () => {
    renderPantalla(<LoginPage />)
    expect(screen.getByPlaceholderText("Usuario")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it("no llama al servidor si faltan credenciales", () => {
    renderPantalla(<LoginPage />)
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("la contraseña va en un campo de tipo password, no a la vista", () => {
    renderPantalla(<LoginPage />)
    expect(screen.getByPlaceholderText("Contraseña")).toHaveAttribute("type", "password")
  })

  it("manda la op new_login, que es el contrato con el backend", async () => {
    renderPantalla(<LoginPage />)
    escribirCredenciales()
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(opsLlamadas(global.fetch)).toContain("new_login")
  })

  it("con credenciales incorrectas no deja sesión a medias", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(JSON.stringify({ status: "error", message: "Usuario o contraseña incorrectos" })),
      }),
    )

    renderPantalla(<LoginPage />)
    escribirCredenciales()
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const { useAuthStore } = await import("../../../store/useAuthStore")
    expect(useAuthStore.getState().user).toBeNull()
  })
})
