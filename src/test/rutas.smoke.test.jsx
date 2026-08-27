import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
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
  "/millasDriversTable",
  "/new-service-order",
  "/nomina",
  "/notifications-admin",
  "/paymentDrivers",
  "/personal",
  "/registros-afinaciones",
  "/reports",
  "/road-repairs",
  "/safety",
  "/ticketPayment/1",
  "/tracking",
  "/trailers",
  "/trips",
  "/trips-new",
  "/trucks",
  "/view-inventory"
];

// Se monta <App/> completo, no <AppRouter/>: el árbol real incluye providers
// que las pantallas consumen (UpdateContext lo provee App, y Sidebar lo lee).
// App ya trae su propio HashRouter y su Provider de redux, así que el test no
// envuelve nada — solo posiciona la ruta en el hash. Cero cambios en producción.
function montarRuta(ruta) {
  window.location.hash = "#" + ruta;
  return render(<App />);
}

describe("humo: todas las rutas montan", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 1, name: "Prueba", tipo_usuario: "admin", username: "prueba" },
      userPermissions: {},
      loading: false,
    });
  });

  it.each(RUTAS)("%s monta sin reventar", (ruta) => {
    montarRuta(ruta);
    // Si el componente tronó al montar, render() ya habría lanzado.
    expect(document.body).toBeInTheDocument();
  });
});
