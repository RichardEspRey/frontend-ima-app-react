import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import ExpenseManagerPage from "../ExpenseManagerPage";
import { renderPantalla, sesionDePrueba, opsLlamadas } from "../../../test/utils";

describe("Expense Manager", () => {
  beforeEach(() => { sesionDePrueba(); });

  it("monta y dibuja el encabezado", async () => {
    renderPantalla(<ExpenseManagerPage />);
    expect(await screen.findByText("Expense Manager")).toBeInTheDocument();
  });

  it("pide los gastos al backend al montar", async () => {
    renderPantalla(<ExpenseManagerPage />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const ops = opsLlamadas(global.fetch);
    expect(ops).toContain("getAllGastos");
  });

  it("muestra el estado vacío cuando el backend no devuelve gastos", async () => {
    renderPantalla(<ExpenseManagerPage />);
    expect(await screen.findByText("No se encontraron gastos.")).toBeInTheDocument();
  });
});
