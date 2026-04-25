import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../core/auth/AuthContext';
import AppRouter from './AppRouter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notiSound from '../assets/sounds/Update2.mp3';

// Contexto temporal para pasar si hay update
export const UpdateContext = React.createContext();

const App = () => {
  const [updateDisponible, setUpdateDisponible] = useState(false);

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

  return (
    <UpdateContext.Provider value={{ updateDisponible }}>
      <AuthProvider>
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
      </AuthProvider>
    </UpdateContext.Provider>
  );
};

export default App;
