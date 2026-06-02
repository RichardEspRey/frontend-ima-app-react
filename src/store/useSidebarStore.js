import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** @typedef {'expanded' | 'collapsed'} SidebarMode */

export const SIDEBAR_WIDTH_EXPANDED = 280;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

export const useSidebarStore = create(
  persist(
    (set) => ({
      /** expanded = barra fija completa | collapsed = solo iconos, expande al hover */
      mode: "expanded",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "expanded" ? "collapsed" : "expanded",
        })),
    }),
    {
      name: "ima-sidebar-prefs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
