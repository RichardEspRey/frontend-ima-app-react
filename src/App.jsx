import React, { useEffect, useState } from 'react';
import AppRouter from './navigation/AppRouter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notiSound from '../src/assets/sounds/Update2.mp3';
import { useAuthStore } from './store/useAuthStore';
import { useNotificationStore } from './store/useNotificationStore';

// Contexto temporal para pasar si hay update
export const UpdateContext = React.createContext();

const App = () => {
  const [updateDisponible, setUpdateDisponible] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const initPushReceiver = useNotificationStore((state) => state.initPushReceiver);
  const lastNotification = useNotificationStore((state) => state.lastNotification);

  useEffect(() => {
    if (window?.electron?.onUpdateAvailable) {
      window.electron.onUpdateAvailable(() => {
        toast.info('Nueva versión disponible', { position: 'top-right' });
        setUpdateDisponible(true);

        const sonido = new Audio(notiSound);
        sonido.play();
      });
    }
  }, []);

  useEffect(() => {
    if (userId) initPushReceiver(userId);
  }, [userId, initPushReceiver]);

  useEffect(() => {
    if (!lastNotification) return;
    const { title, body } = lastNotification;
    toast.info(body ? `${title}: ${body}` : title, { position: 'top-right' });

    const sonido = new Audio(notiSound);
    sonido.play();
  }, [lastNotification]);

  return (
    <UpdateContext.Provider value={{ updateDisponible }}>
        <AppRouter />
        <ToastContainer position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover
          theme="light"
           />
    </UpdateContext.Provider>
  );
};

export default App;
