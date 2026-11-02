import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ModalArchivo from "../ModalArchivo"

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:nuevo")
  URL.revokeObjectURL = vi.fn()
})

const docExistente = () => ({ fileName: "BL viejo.pdf", url: "http://api/Uploads/Trips/viejo.pdf" })

const pdf = () => new File(["%PDF-1.4\n%prueba"], "BL nuevo.pdf", { type: "application/pdf" })

describe("ModalArchivo", () => {
  it("conserva el archivo elegido aunque la pantalla se vuelva a pintar con un valorActual nuevo", async () => {
    const onSave = vi.fn()
    const props = { isOpen: true, onClose: vi.fn(), onSave, mostrarFechaVencimiento: false, accept: "application/pdf,image/jpeg,image/png" }
    const { container, rerender } = render(<ModalArchivo {...props} valorActual={docExistente()} />)

    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [pdf()] } })
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())

    rerender(<ModalArchivo {...props} valorActual={docExistente()} />)
    fireEvent.click(screen.getByRole("button", { name: "Reemplazar" }))

    expect(screen.queryByText(/selecciona o arrastra el archivo nuevo/i)).toBeNull()
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ fileName: "BL nuevo.pdf", hasNewFile: true }))
  })

  it("al volver a abrirse empieza sin archivo elegido", async () => {
    const props = { onClose: vi.fn(), onSave: vi.fn(), mostrarFechaVencimiento: false, accept: "application/pdf" }
    const { container, rerender } = render(<ModalArchivo {...props} isOpen valorActual={docExistente()} />)

    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [pdf()] } })
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())

    rerender(<ModalArchivo {...props} isOpen={false} valorActual={docExistente()} />)
    rerender(<ModalArchivo {...props} isOpen valorActual={docExistente()} />)
    fireEvent.click(screen.getByRole("button", { name: "Reemplazar" }))

    expect(props.onSave).not.toHaveBeenCalled()
    expect(screen.getByText(/selecciona o arrastra el archivo nuevo/i)).toBeTruthy()
  })
})
