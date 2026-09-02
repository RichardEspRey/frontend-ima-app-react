import React, { useEffect, useState } from 'react';
import AppRouter from './navigation/AppRouter';
import notiSound from '../src/assets/sounds/Update2.mp3';
import { QueryProvider } from './app/providers/QueryProvider';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { instalarErroresGlobales } from './app/erroresGlobales';
import { notify } from './shared/ui';
import { IdiomaProvider } from './shared/i18n';
import { SessionProvider } from './app/providers/SessionProvider';

// Contexto temporal para pasar si hay update
export const UpdateContext = React.createContext();

const App = () => {
  const [updateDisponible, setUpdateDisponible] = useState(false);

  useEffect(() => instalarErroresGlobales(), []);

  useEffect(() => {
    if (window?.electron?.onUpdateAvailable) {
      window.electron.onUpdateAvailable(() => {
        notify.discreto('Hay una nueva versión disponible.', 'info');
        setUpdateDisponible(true);

        const sonido = new Audio(notiSound);
        sonido.play();
      });
    }
  }, []);

  return (
    <UpdateContext.Provider value={{ updateDisponible }}>
      <ThemeProvider>
      <IdiomaProvider>
      <QueryProvider>
        <SessionProvider>
        <AppRouter />
        </SessionProvider>
      </QueryProvider>
      </IdiomaProvider>
      </ThemeProvider>
    </UpdateContext.Provider>
  );
};

export default App;
