import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SessionProvider } from "../app/providers/SessionProvider";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Deja la sesión lista antes de renderizar.
 * Muchas pantallas leen user?.id o user?.tipo_usuario al montar y cambian lo
 * que dibujan según el rol, así que el default es admin: es el camino que más
 * UI ejercita (ve todos los botones y columnas).
 */
export function sesionDePrueba(overrides = {}) {
  const user = {
    id: 1,
    name: "Usuario Prueba",
    tipo_usuario: "admin",
    username: "prueba",
    ...overrides,
  };
  useAuthStore.setState({ user, userPermissions: {}, loading: false });
  return user;
}

export function sinSesion() {
  useAuthStore.setState({ user: null, userPermissions: {}, loading: false });
}

/**
 * Renderiza un componente de pantalla con los providers que la app le da en
 * producción (el router). `ruta` y `path` permiten probar pantallas que
 * leen useParams, p.ej. renderPantalla(<ExpenseEdit/>, {
 *   path: '/edit-expense/:id_gasto', ruta: '/edit-expense/7'
 * })
 */
export function renderPantalla(ui, { path = "/", ruta = "/" } = {}) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

/**
 * Devuelve las `op` de todas las peticiones que hizo la pantalla.
 * Es la aserción central de la fase 1: el refactor puede cambiar cómo está
 * escrita una pantalla, pero NO qué le pide al backend.
 *
 * Tolera llamadas sin init (p.ej. useFetchExchangeRate hace fetch(url) pelón)
 * y cuerpos que no son FormData.
 */
export function opsLlamadas(mockFetch) {
  return mockFetch.mock.calls
    .map(([, init]) => {
      const body = init?.body;
      return body instanceof FormData ? body.get("op") : null;
    })
    .filter(Boolean);
}
