import { describe, it, expect } from "vitest"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

describe("jspdf: la API que usa la app sigue existiendo", () => {
  it("construye un documento con las tres firmas que se usan", () => {
    expect(new jsPDF()).toBeTruthy()
    expect(new jsPDF("p", "mm", "a4")).toBeTruthy()
    expect(
      new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" }),
    ).toBeTruthy()
  })

  it("escribe texto y cambia el tamaño de fuente", () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Ticket de pago", 10, 20)
    expect(doc.internal.getNumberOfPages()).toBe(1)
  })

  it("expone internal.pageSize, que se usa para centrar", () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" })
    expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(0)
    expect(doc.internal.pageSize.getHeight()).toBeGreaterThan(0)
  })

  it("devuelve el documento como blob con output()", () => {
    const doc = new jsPDF()
    doc.text("x", 10, 10)
    expect(doc.output("blob")).toBeInstanceOf(Blob)
  })

  it("autoTable dibuja una tabla y avanza el cursor", () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [["Fecha", "Concepto", "Monto"]],
      body: [
        ["2026-08-31", "Diesel", "1,200.00"],
        ["2026-08-30", "Casetas", "340.50"],
      ],
      startY: 30,
    })
    expect(doc.lastAutoTable.finalY).toBeGreaterThan(30)
  })

  it("autoTable con muchas filas pagina en vez de reventar", () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [["#", "Descripción"]],
      body: Array.from({ length: 120 }, (_, i) => [String(i), `Fila ${i}`]),
    })
    expect(doc.internal.getNumberOfPages()).toBeGreaterThan(1)
  })
})
