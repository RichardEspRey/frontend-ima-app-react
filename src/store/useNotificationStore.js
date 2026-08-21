import { create } from "zustand";

const apiHost = import.meta.env.VITE_API_HOST;
const fcmAppId = import.meta.env.VITE_FCM_APP_ID;
const fcmProjectId = import.meta.env.VITE_FCM_PROJECT_ID;
const fcmApiKey = import.meta.env.VITE_FCM_API_KEY;
const fcmVapidKey = import.meta.env.VITE_FCM_VAPID_KEY;

const normalizeNotification = (payload) => ({
  title: payload?.notification?.title ?? payload?.data?.title ?? "Notificación",
  body: payload?.notification?.body ?? payload?.data?.body ?? "",
  data: payload?.data ?? {},
});

export const useNotificationStore = create((set, get) => ({
  token: null,
  initialized: false,
  lastNotification: null,

  initPushReceiver: (userId) => {
    if (get().initialized) return;
    if (!window?.electron?.startPushReceiver) return;
    if (!fcmAppId || !fcmProjectId || !fcmApiKey || !fcmVapidKey) {
      console.warn("Faltan variables VITE_FCM_* en .env; no se puede iniciar FCM.");
      return;
    }

    const onTokenReceived = (token) => {
      set({ token });
      get().registerToken(userId, token);
    };

    window.electron.onTokenUpdate(onTokenReceived);
    window.electron.onPushServiceRestarted(onTokenReceived);

    window.electron.onNotificationReceived((payload) => {
      set({ lastNotification: normalizeNotification(payload) });
    });

    window.electron.onPushError((error) => {
      console.error("Error del servicio de notificaciones push:", error);
    });

    window.electron.startPushReceiver(fcmAppId, fcmProjectId, fcmApiKey, fcmVapidKey);
    set({ initialized: true });
  },

  registerToken: async (userId, token) => {
    if (!userId || !token) return;
    try {
      const fd = new FormData();
      fd.append("op", "register_token");
      fd.append("user_id", userId);
      fd.append("token", token);
      fd.append("platform", "Desktop");

      await fetch(`${apiHost}/notifications.php`, { method: "POST", body: fd });
    } catch (error) {
      console.error("Error registrando token de notificaciones:", error);
    }
  },

  unregisterToken: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const fd = new FormData();
      fd.append("op", "unregister_token");
      fd.append("token", token);

      await fetch(`${apiHost}/notifications.php`, { method: "POST", body: fd });
    } catch (error) {
      console.error("Error eliminando token de notificaciones:", error);
    } finally {
      set({ token: null, initialized: false });
    }
  },
}));
