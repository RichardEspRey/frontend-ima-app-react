import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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

global.Audio = class {
  play() { return Promise.resolve(); }
  pause() {}
};

window.scrollTo = () => {};
global.URL.createObjectURL = () => "blob:mock";
global.URL.revokeObjectURL = () => {};

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
