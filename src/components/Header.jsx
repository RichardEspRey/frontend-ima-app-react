import React from "react";
import { Box, Avatar, Typography, Stack, Paper } from "@mui/material";
import { useAuthStore } from "../store/useAuthStore";

const Header = () => {
  const { user } = useAuthStore();

  const userName = user?.name || "Cargando...";
  const userRole = user?.tipo_usuario || "Usuario";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <Paper 
      square
      elevation={0}
      sx={{ 
        height: 70, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        px: 4, 
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 10
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ cursor: 'pointer' }}>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2" fontWeight={800} color="#0f172a" lineHeight={1.2}>
            {userName}
          </Typography>
          <Typography variant="caption" color="#64748b" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {userRole}
          </Typography>
        </Box>

        <Avatar 
          sx={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white', 
            fontWeight: 800,
            width: 40,
            height: 40,
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)' 
            }
          }}
        >
          {userInitial}
        </Avatar>

      </Stack>
    </Paper>
  );
};

export default Header;