import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import AdminGastos from "../AdminGastos";
import { renderPantalla, sesionDePrueba, opsLlamadas } from "../../../test/utils";

describe("AdminGastos (Expense Manager)", () => {
  beforeEach(() => { sesionDePrueba(); });

  it("monta y dibuja el encabezado", async () => {
    renderPantalla(<AdminGastos />);
    expect(await screen.findByText("Expense Manager")).toBeInTheDocument();
  });

  it("pide los gastos al backend al montar", async () => {
    renderPantalla(<AdminGastos />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // La op tiene que seguir siendo getAllGastos: el refactor no debe cambiar
    // el contrato con el backend (fase 1 = endpoints intactos).
    // No se asume el orden: la pantalla monta un modal hijo que pide sus
    // catálogos (getExpenseTypes, getCategories...) en paralelo.
    const ops = opsLlamadas(global.fetch);
    expect(ops).toContain("getAllGastos");
  });

  it("muestra el estado vacío cuando el backend no devuelve gastos", async () => {
    renderPantalla(<AdminGastos />);
    expect(await screen.findByText("No se encontraron gastos.")).toBeInTheDocument();
  });
});
