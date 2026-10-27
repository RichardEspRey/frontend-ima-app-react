import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import PermisosDrawer from "../ui/PermisosDrawer";
import { renderPantalla, sesionDePrueba } from "../../../test/utils";

const panel = (type) => (
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
  />
);

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
});
