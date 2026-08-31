import React, { useEffect, useState } from 'react';
import AppRouter from './navigation/AppRouter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notiSound from '../src/assets/sounds/Update2.mp3';
import { QueryProvider } from './app/providers/QueryProvider';

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
      <QueryProvider>
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
      </QueryProvider>
    </UpdateContext.Provider>
  );
};

export default App;
