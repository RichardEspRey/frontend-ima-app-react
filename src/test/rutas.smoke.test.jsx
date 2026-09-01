import { describe, it, expect, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import App from "../App";
import { useAuthStore } from "../store/useAuthStore";

/* ---------------------------------------------------------------------------
   Test de humo a nivel ruta.

   Esta es la red que protege el refactor: monta CADA ruta con el router, el
   layout y los providers reales. Si un archivo se mueve y queda un import
   roto, o una pantalla revienta al montar, aquí se cae — que es exactamente
   lo que el `vite build` NO detecta (el build valida que el import resuelva,
   no que el componente monte).

   La lista sale de AppRouter.jsx. Si agregas una ruta, agrégala aquí.
--------------------------------------------------------------------------- */

const RUTAS = [
  "/CrearViaje",
  "/Ifta",
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
  "/edit-expense/1",
  "/edit-trip-complete/1",
  "/edit-trip-upcoming/1",
  "/edit-trip/1",
  "/editar-orden/1",
  "/editor-diesel/1/1",
  "/editor-gastos/1/1",
  "/estatus-unidades",
  "/finanzas",
  "/home",
  "/ima-manager",
  "/inspecciones",
  "/margen",
  "/millasDriversTable",
  "/new-service-order",
  "/nomina",
  "/paymentDrivers",
  "/personal",
  "/registros-afinaciones",
  "/reports",
  "/road-repairs",
  "/safety",
  "/ticketPayment/1",
  "/tracking",
  "/view-inventory"
];

// Se monta <App/> completo, no <AppRouter/>: el árbol real incluye providers
// que las pantallas consumen (UpdateContext lo provee App, y Sidebar lo lee).
// App ya trae su propio HashRouter, así que el test no
// envuelve nada — solo posiciona la ruta en el hash. Cero cambios en producción.
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
