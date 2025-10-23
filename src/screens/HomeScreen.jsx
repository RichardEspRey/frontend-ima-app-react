import { Box, Typography } from '@mui/material'; 

const HomeScreen = () => {
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
          color: 'text.primary'
        }}
      >
        Welcome to the Dashboard
      </Typography>
    </Box>
  );
};

export default HomeScreen;