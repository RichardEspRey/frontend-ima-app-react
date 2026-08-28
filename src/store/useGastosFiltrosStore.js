import { create } from "zustand";

const ESTADO_INICIAL = {
  search: "",
  filterCountry: "All",
  filterType: "All",
  filterCategory: "All",
  filterSubcategory: "All",
  filterDescription: "",
  startDate: "",
  endDate: "",
  page: 0,
  rowsPerPage: 20,
  orden: { campo: null, dir: null },
  showFilters: false,
};

export const useGastosFiltrosStore = create((set) => ({
  ...ESTADO_INICIAL,

  set: (parche) => set(parche),

  setFiltro: (parche) => set({ ...parche, page: 0 }),

  limpiarFiltros: () =>
    set({
      search: "",
      filterCountry: "All",
      filterType: "All",
      filterCategory: "All",
      filterSubcategory: "All",
      filterDescription: "",
      startDate: "",
      endDate: "",
      page: 0,
    }),
}));
