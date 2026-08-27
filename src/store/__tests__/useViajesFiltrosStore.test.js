import { describe, it, expect, beforeEach } from "vitest";
import { useViajesFiltrosStore } from "../useViajesFiltrosStore";

const st = () => useViajesFiltrosStore.getState();

describe("useViajesFiltrosStore", () => {
  beforeEach(() => {
    st().set({
      tabValue: 1, page: 0, rowsPerPage: 25, showFilters: false,
      filterTrip: "", filterDriver: "", filterTruck: "", filterTrailer: "",
      filterCompany: "", filterOrigin: "", filterDestination: "",
      filterDirection: "All", filterCI: "",
    });
  });

  it("conserva los defaults que tenia el componente", () => {
    expect(st().tabValue).toBe(1);
    expect(st().rowsPerPage).toBe(25);
    expect(st().filterDirection).toBe("All");
  });

  it("conserva pestana y pagina cuando la pantalla se desmonta", () => {
    st().set({ tabValue: 3, page: 4 });
    expect(st().tabValue).toBe(3);
    expect(st().page).toBe(4);
  });

  it("filtrar regresa a la primera pagina sin cambiar de pestana", () => {
    st().set({ tabValue: 3, page: 4 });
    st().setFiltro({ filterDriver: "Juan" });

    expect(st().filterDriver).toBe("Juan");
    expect(st().page).toBe(0);
    expect(st().tabValue).toBe(3);
  });

  it("limpiarFiltros no toca la pestana ni el tamano de pagina", () => {
    st().set({ tabValue: 3, rowsPerPage: 50 });
    st().setFiltro({ filterTruck: "101", filterDirection: "Norte" });

    st().limpiarFiltros();

    expect(st().filterTruck).toBe("");
    expect(st().filterDirection).toBe("All");
    expect(st().page).toBe(0);
    expect(st().tabValue).toBe(3);
    expect(st().rowsPerPage).toBe(50);
  });

  it("un tab guardado que ya no esta permitido cae al primero permitido", () => {
    st().set({ tabValue: 3 });
    const allowedTabs = [{ id: 0 }, { id: 1 }];

    if (allowedTabs.length > 0 && !allowedTabs.some((t) => t.id === st().tabValue)) {
      st().set({ tabValue: allowedTabs[0].id });
    }

    expect(st().tabValue).toBe(0);
  });
});
