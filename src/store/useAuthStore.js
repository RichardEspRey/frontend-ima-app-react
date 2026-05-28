import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const apiHost = import.meta.env.VITE_API_HOST;
const ADMIN_TYPES = new Set(["admin"]);

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
            // Convierte [{feature_key, enabled}] → { feature_key: bool }
            const permissions = Object.fromEntries(
              (data.features || []).map((f) => [f.feature_key, f.enabled === 1 || f.enabled === "1"])
            );
            set({ userPermissions: permissions });
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
        } finally {
          set({ loading: false });
        }
      },

      // featureKey: string from menuConfig (preferred). sectionName: fallback by name.
      checkAccess: (sectionName, menuConfigTree, featureKey) => {
        const { user, userPermissions } = get();
        if (!user) return false;
        if (ADMIN_TYPES.has(user.tipo_usuario.toLowerCase())) return true;

        const lookupKey = featureKey ?? sectionName;
        if (userPermissions[lookupKey] !== undefined) {
          return userPermissions[lookupKey] === true;
        }

        const findRoleInTree = (items) => {
          for (let item of items) {
            if (item.name === sectionName)
              return item.rolesPermitidos?.includes(user.tipo_usuario);
            if (item.subItems) {
              const found = findRoleInTree(item.subItems);
              if (found !== undefined) return found;
            }
          }
          return undefined;
        };

        return findRoleInTree(menuConfigTree) === true;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
