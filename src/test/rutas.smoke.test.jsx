import { describe, it, expect, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import App from "../App";
import { useAuthStore } from "../store/useAuthStore";

const RUTAS = [
  "/CrearViaje",
  "/Ifta",
  "/ImaAdmin",
  "/ImaScreen",
  "/Inspeccion-final",
  "/ResiduoTrip",
  "/ResumenTrip/1",
  "/access-manager",
  "/admin-diesel",
  "/admin-drivers",
  "/admin-gastos",
  "/admin-gastos-generales",
  "/admin-service-order",
  "/admin-trailers",
  "/admin-trips",
  "/admin-trucks",
  "/afinaciones",
  "/autonomia",
  "/cotizador",
  "/detalle-diesel/1",
  "/detalle-gastos/1",
  "/detalle-pago/1",
  "/drivers",
  "/edit-expense/1",
  "/edit-trailer/1",
  "/edit-trip-complete/1",
  "/edit-trip-upcoming/1",
  "/edit-trip/1",
  "/editar-orden/1",
  "/editor-diesel/1/1",
  "/editor-drivers/1",
  "/editor-gastos/1/1",
  "/editor-trailers/1",
  "/editor-trucks/1",
  "/estatus-unidades",
  "/finanzas",
  "/home",
  "/ima-manager",
  "/inspecciones",
  "/margen",
  "/new-service-order",
  "/nomina",
  "/paymentDrivers",
  "/personal",
  "/registros-afinaciones",
  "/reports",
  "/road-repairs",
  "/safety",
  "/tracking",
  "/trailers",
  "/trips",
  "/trips-new",
  "/trucks",
  "/view-inventory",
]

async function montarRuta(ruta) {
  window.location.hash = "#" + ruta;
  const resultado = render(<App />);
  await act(async () => {
    await new Promise((listo) => setTimeout(listo, 0));
  });
  return resultado;
}

describe("humo: todas las rutas montan", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 1, name: "Prueba", tipo_usuario: "admin", username: "prueba" },
      userPermissions: {},
      loading: false,
    });
  });

  it.each(RUTAS)("%s monta sin reventar", async (ruta) => {
    await montarRuta(ruta);
    expect(document.body).toBeInTheDocument();
  });
});
