import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const apiHost = import.meta.env.VITE_API_HOST;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userPermissions: {},
      loading: false,

      login: async (id, name, type, email) => {
        const userData = { id, name, tipo_usuario: type, email };
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
          fd.append("op", "getUserPermissions");
          fd.append("user_id", userId);

          const res = await fetch(`${apiHost}/AccessManager.php`, {
            method: "POST",
            body: fd,
          });
          const data = await res.json();

          if (data.status === "success") {
            set({ userPermissions: data.permissions || {}, loading: false });
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
          set({ loading: false });
        }
      },

      checkAccess: (sectionName, menuConfigTree) => {
        const { user, userPermissions } = get();
        if (!user) return false;
        if (user.tipo_usuario.toLowerCase() === "admin") return true;

        if (userPermissions[sectionName] !== undefined) {
          return userPermissions[sectionName] === true;
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

        const defaultAccess = findRoleInTree(menuConfigTree);
        return defaultAccess === true;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
