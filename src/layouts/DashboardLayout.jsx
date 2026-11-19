import React, { useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';
import { useAvisoDeNotificaciones } from '../features/notifications';
import { COLOR } from '../shared/ui/tokens';
import { ErrorBoundary } from '../shared/ui';
import { sondear } from '../shared/lib/sondeo';

const PERMISOS_MS = 60 * 1000;
const PERMISOS_AL_CAMBIAR_PANTALLA_MS = 10 * 1000;

/**
 * El marco de las pantallas con sesión: menú lateral, encabezado y contenido.
 *
 * También mantiene al día los permisos de la persona: los pide cada minuto con
 * la ventana a la vista y, además, al cambiar de pantalla (si la última consulta
 * tiene más de 10 segundos). Así un permiso que se quita en el Gestor de accesos
 * se aplica en cuanto la persona se mueve, sin tener que salir y volver a entrar.
 *
 * @returns {object} El marco renderizado.
 */
const DashboardLayout = () => {
  const { user, fetchPermissions } = useAuthStore();
  const { pathname } = useLocation();

  useAvisoDeNotificaciones(user?.id);

  const ultimaConsultaPermisos = useRef(0);
  const refrescarPermisos = useCallback(() => {
    if (!user?.id) return undefined;
    ultimaConsultaPermisos.current = Date.now();
    return fetchPermissions(user.id);
  }, [user?.id, fetchPermissions]);

  useEffect(() => {
    if (!user?.id) return;

    return sondear(refrescarPermisos, {
      visibleMs: PERMISOS_MS,
      ocultoMs: null,
    });
  }, [user?.id, refrescarPermisos]);

  useEffect(() => {
    if (Date.now() - ultimaConsultaPermisos.current < PERMISOS_AL_CAMBIAR_PANTALLA_MS) return;
    refrescarPermisos();
  }, [pathname, refrescarPermisos]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: COLOR.LIENZO,
        overflow: 'hidden',
        fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif'
      }}
    >
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, md: 4 },
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: COLOR.BORDE_FUERTE, borderRadius: '4px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
          }}
        >
          <ErrorBoundary clave={pathname}>
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
