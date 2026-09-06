import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';
import notiSound from '../assets/sounds/update.mp3';

const DashboardLayout = () => {
  const { user, fetchPermissions } = useAuthStore();
  const seenNotificationIds = useRef(new Set());

  useEffect(() => {
    if (!user?.id) return;

    const intervalId = setInterval(() => {
        fetchPermissions(user.id);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user?.id, fetchPermissions]);

  useEffect(() => {
    if (!user?.id) return;

    const apiHost = import.meta.env.VITE_API_HOST;

    const pollNotifications = async () => {
      try {
        const formData = new FormData();
        formData.append('op', 'getAll');
        formData.append('user_id', user.id);

        const response = await fetch(`${apiHost}/Notifications.php`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.status !== 'success' || !Array.isArray(data.notifications)) return;

        const nuevas = data.notifications.filter(
          (n) => !seenNotificationIds.current.has(n.id)
        );
        if (nuevas.length === 0) return;

        nuevas.forEach((n) => {
          seenNotificationIds.current.add(n.id);
          toast.info(n.mensaje, { position: 'top-right' });
        });

        new Audio(notiSound).play();
      } catch (error) {
        console.error('[Notifications] Error al consultar notificaciones:', error);
      }
    };

    pollNotifications();
    const intervalId = setInterval(pollNotifications, 15000);

    return () => clearInterval(intervalId);
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