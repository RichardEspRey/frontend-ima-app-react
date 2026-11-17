import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';
import notiSound from '../assets/sounds/update.mp3';
import { sondear, EVENTO_NOTIFICACIONES_NUEVAS } from '../utils/sondeo';

const PERMISOS_MS = 5 * 60 * 1000;
const NOTIFICACIONES_MS = 30 * 1000;
const NOTIFICACIONES_OCULTA_MS = 60 * 1000;

const DashboardLayout = () => {
  const { user, fetchPermissions } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    return sondear(() => fetchPermissions(user.id), {
      visibleMs: PERMISOS_MS,
      ocultoMs: null,
    });
  }, [user?.id, fetchPermissions]);

  useEffect(() => {
    if (!user?.id) return;

    const apiHost = import.meta.env.VITE_API_HOST;

    const pollNotifications = async () => {
      try {
        const formData = new FormData();
        formData.append('op', 'getNew');
        formData.append('user_id', user.id);

        const response = await fetch(`${apiHost}/Notifications.php`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.status !== 'success' || !Array.isArray(data.notifications) || data.notifications.length === 0) return;

        data.notifications.forEach((n) => {
          toast.info(n.Mensaje, { position: 'top-right' });
        });

        new Audio(notiSound).play();
        window.dispatchEvent(new Event(EVENTO_NOTIFICACIONES_NUEVAS));
      } catch (error) {
        console.error('[Notifications] Error al consultar notificaciones:', error);
      }
    };

    return sondear(pollNotifications, {
      visibleMs: NOTIFICACIONES_MS,
      ocultoMs: NOTIFICACIONES_OCULTA_MS,
    });
  }, [user?.id]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100vh', 
        bgcolor: '#f8fafc',
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
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '4px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;