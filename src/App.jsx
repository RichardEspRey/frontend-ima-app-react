import React, { useEffect, useRef, useState } from 'react';
import AppRouter from './navigation/AppRouter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notiSound from '../src/assets/sounds/Update2.mp3';

// Contexto temporal para pasar si hay update
export const UpdateContext = React.createContext();

const App = () => {
  const [updateDisponible, setUpdateDisponible] = useState(false);
  const versionAvisada = useRef(null);

  useEffect(() => {
    if (!window?.electron?.onUpdateAvailable) return undefined;

    const baja = window.electron.onUpdateAvailable((datos) => {
        const version = datos?.version || 'nueva';
        setUpdateDisponible(true);
        if (versionAvisada.current === version) return;
        versionAvisada.current = version;

        toast.info(
          `Nueva versión${datos?.version ? ` ${datos.version}` : ''} disponible. Haz clic aquí para actualizar.`,
          {
            toastId: 'actualizacion-disponible',
            position: 'top-right',
            autoClose: false,
            closeOnClick: true,
            onClick: () => window.electron?.descargarUpdate?.(),
          }
        );

        const sonido = new Audio(notiSound);
        sonido.play().catch(() => {});
    });

    return typeof baja === 'function' ? baja : undefined;
  }, []);

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
