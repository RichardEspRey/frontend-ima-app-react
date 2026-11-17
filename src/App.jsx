import React, { useEffect, useRef, useState } from 'react';
import AppRouter from './navigation/AppRouter';
import notiSound from '../src/assets/sounds/Update2.mp3';
import { QueryProvider } from './app/providers/QueryProvider';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { instalarErroresGlobales } from './app/erroresGlobales';
import { notify } from './shared/ui';
import { SessionProvider } from './app/providers/SessionProvider';

export const UpdateContext = React.createContext();

const DURACION_AVISO_VERSION_MS = 60_000;

const App = () => {
  const [updateDisponible, setUpdateDisponible] = useState(false);
  const versionAvisada = useRef(null);

  useEffect(() => instalarErroresGlobales(), []);

  useEffect(() => {
    if (!window?.electron?.onUpdateAvailable) return undefined;

    const baja = window.electron.onUpdateAvailable((datos) => {
        const version = datos?.version || 'nueva';
        setUpdateDisponible(true);
        if (versionAvisada.current === version) return;
        versionAvisada.current = version;

        notify.discreto(
          `Nueva versión${datos?.version ? ` ${datos.version}` : ''} disponible. Usa el botón verde «Actualizar» de la barra lateral.`,
          'info',
          DURACION_AVISO_VERSION_MS,
        );

        const sonido = new Audio(notiSound);
        sonido.play().catch(() => {});
    });

    return typeof baja === 'function' ? baja : undefined;
  }, []);

  return (
    <UpdateContext.Provider value={{ updateDisponible }}>
      <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
        <AppRouter />
        </SessionProvider>
      </QueryProvider>
      </ThemeProvider>
    </UpdateContext.Provider>
  );
};

export default App;
