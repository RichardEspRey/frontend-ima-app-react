import { create } from "zustand";

const FILTROS_VACIOS = {
  filterTrip: "",
  filterDriver: "",
  filterTruck: "",
  filterTrailer: "",
  filterCompany: "",
  filterOrigin: "",
  filterDestination: "",
  filterDirection: "All",
  filterCI: "",
};

export const useViajesFiltrosStore = create((set) => ({
  ...FILTROS_VACIOS,
  tabValue: 1,
  page: 0,
  rowsPerPage: 25,
  showFilters: false,

  set: (parche) => set(parche),

  setFiltro: (parche) => set({ ...parche, page: 0 }),

  limpiarFiltros: () => set({ ...FILTROS_VACIOS, page: 0 }),
}));
