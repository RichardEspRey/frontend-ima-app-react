import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import PermisosDrawer from "../ui/PermisosDrawer";
import { renderPantalla, sesionDePrueba } from "../../../test/utils";

const panel = (type, extra = {}) => (
  <PermisosDrawer
    open
    handleClose={() => {}}
    user={{ id: "7", name: "Ana Pérez", user: "ana", type, active: "1" }}
    sectionsToManage={[]}
    featuresDesktop={[]}
    featuresMobile={[]}
    featuresLoading={false}
    onToggleFeature={() => {}}
    onUpdateUser={() => {}}
    {...extra}
  />
);

/**
 * El selector de tipo del usuario: el único combo que muestra «Driver».
 *
 * @returns {HTMLElement} El combo.
 */
const selectorDeTipo = () =>
  screen.getAllByRole("combobox").find((combo) => combo.textContent === "Driver");

describe("PermisosDrawer", () => {
  beforeEach(() => { sesionDePrueba(); });

  it("a un operador no le ofrece la pestaña Desktop", async () => {
    renderPantalla(panel("Driver"));
    expect(await screen.findByRole("tab", { name: /Mobile/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Datos/ })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Desktop/ })).not.toBeInTheDocument();
  });

  it("a un administrativo le deja las tres pestañas", async () => {
    renderPantalla(panel("Administrativo"));
    expect(await screen.findByRole("tab", { name: /Desktop/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Mobile/ })).toBeInTheDocument();
  });

  it("a quien solo administra Drivers no le deja cambiar el tipo", async () => {
    renderPantalla(panel("Driver", { soloDrivers: true }));
    await screen.findByRole("tab", { name: /Datos/ });
    const tipo = selectorDeTipo();
    expect(tipo).toHaveAttribute("aria-disabled", "true");
  });

  it("al administrador sí le deja cambiar el tipo", async () => {
    renderPantalla(panel("Driver"));
    await screen.findByRole("tab", { name: /Datos/ });
    const tipo = selectorDeTipo();
    expect(tipo).not.toHaveAttribute("aria-disabled", "true");
  });
});
