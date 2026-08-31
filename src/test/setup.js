import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

/* ---------------------------------------------------------------------------
   APIs del navegador que jsdom no trae y que la app sí usa.
   Sin estos mocks las pantallas revientan al montar, y el test fallaría por el
   entorno en vez de por el código — que es justo lo que no queremos.
--------------------------------------------------------------------------- */

// @mui/x-charts mide su contenedor al montar.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// MUI consulta breakpoints con matchMedia.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// App.jsx reproduce un sonido cuando llega una notificación.
global.Audio = class {
  play() { return Promise.resolve(); }
  pause() {}
};

window.scrollTo = () => {};
global.URL.createObjectURL = () => "blob:mock";
global.URL.revokeObjectURL = () => {};

/* ---------------------------------------------------------------------------
   fetch: por defecto responde el "éxito vacío" que usa la API de IMA. Cada
   pantalla lee su payload con un nombre distinto, así que la respuesta trae
   vacías todas las claves que las pantallas iteran. Si agregas una ruta al
   smoke test y falla con "cannot read properties of undefined", la clave que
   lee esa pantalla falta en esta lista.
   Un test que necesite otra respuesta sobreescribe global.fetch.
--------------------------------------------------------------------------- */
export const respuestaVacia = {
  status: "success",
  message: "",
  data: [],
  features: [],
  users: [],
  drivers: [],
  requisitos: [],
  valores: [],
  detalles: [],
  tickets: [],
  stages: [],
  documentos: [],
  info_viaje: {},
  saved_data: {},
};

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(respuestaVacia),
      text: () => Promise.resolve(JSON.stringify(respuestaVacia)),
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});
