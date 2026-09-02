import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore'; 
import { COLOR } from '../shared/ui/tokens';
import { ErrorBoundary } from '../shared/ui';

const DashboardLayout = () => {
  const { user, fetchPermissions } = useAuthStore();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user?.id) return;

    const intervalId = setInterval(() => {
        fetchPermissions(user.id);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user?.id, fetchPermissions]);

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