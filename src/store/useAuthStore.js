import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const apiHost = import.meta.env.VITE_API_HOST;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userPermissions: {},
      loading: false,

      login: async (id, name, type, username) => {
        const userData = { id, name, tipo_usuario: type, username };
        set({ user: userData, loading: true });
        await get().fetchPermissions(id);
      },

      logout: () => {
        set({ user: null, userPermissions: {}, loading: false });
      },

      fetchPermissions: async (userId) => {
        if (!userId) return;
        try {
          const fd = new FormData();
          fd.append("op", "get_user_features");
          fd.append("user_id", userId);
          fd.append("app", "Desktop");

          const res = await fetch(`${apiHost}/features.php`, {
            method: "POST",
            body: fd,
          });
          const data = await res.json();

          if (data.status === "success") {
            const permissions = Object.fromEntries(
              (data.features || []).map((f) => [
                f.feature_key,
                f.enabled === 1 || f.enabled === "1",
              ]),
            );
            set({ userPermissions: permissions });
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
