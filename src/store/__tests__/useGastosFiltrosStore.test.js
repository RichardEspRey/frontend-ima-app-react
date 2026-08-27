import { describe, it, expect, beforeEach } from "vitest";
import { useGastosFiltrosStore } from "../useGastosFiltrosStore";

const st = () => useGastosFiltrosStore.getState();

describe("useGastosFiltrosStore", () => {
  beforeEach(() => {
    st().set({
      search: "", filterCountry: "All", filterType: "All", filterCategory: "All",
      startDate: "", endDate: "", page: 0, rowsPerPage: 20,
      orden: { campo: null, dir: null }, showFilters: false,
    });
  });

  it("arranca sin filtros aplicados", () => {
    expect(st().search).toBe("");
    expect(st().filterCountry).toBe("All");
    expect(st().page).toBe(0);
  });

  it("aplicar un filtro regresa a la primera pagina", () => {
    st().set({ page: 3 });
    st().setFiltro({ filterCountry: "MX" });
    expect(st().filterCountry).toBe("MX");
    expect(st().page).toBe(0);
  });

  it("conserva filtros, pagina y orden cuando la pantalla se desmonta", () => {
    st().setFiltro({ search: "diesel", filterType: "Diesel" });
    st().set({ page: 2, orden: { campo: "usd", dir: "desc" } });

    expect(st().search).toBe("diesel");
    expect(st().filterType).toBe("Diesel");
    expect(st().page).toBe(2);
    expect(st().orden).toEqual({ campo: "usd", dir: "desc" });
  });

  it("limpiarFiltros no toca el orden ni el tamano de pagina", () => {
    st().setFiltro({ search: "diesel", filterCountry: "MX" });
    st().set({ orden: { campo: "usd", dir: "desc" }, rowsPerPage: 40 });

    st().limpiarFiltros();

    expect(st().search).toBe("");
    expect(st().filterCountry).toBe("All");
    expect(st().page).toBe(0);
    expect(st().orden).toEqual({ campo: "usd", dir: "desc" });
    expect(st().rowsPerPage).toBe(40);
  });
});
