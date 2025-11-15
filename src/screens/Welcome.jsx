import { Box, Typography } from '@mui/material'; 

export const Welcome = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%', 
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        sx={{ 
          fontWeight: 700, 
          color: 'text.secondary',
          letterSpacing: '0.5px'
        }}
      >
        Welcome to the Dashboard
      </Typography>
    </Box>
  );
};