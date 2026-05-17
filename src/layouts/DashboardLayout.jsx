import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore'; 

const DashboardLayout = () => {
  const { user, fetchPermissions } = useAuthStore();

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