import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, TextField, Button, InputAdornment, CircularProgress 
} from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';

import fondo from '../../assets/images/hero.jpg';
import logo from '../../assets/images/logo.png';
import { useAuthStore } from '../../store/useAuthStore'; // 🚨 Zustand ya está aquí manejando la sesión

const Login = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [usermail, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usermail || !password) {
      return Swal.fire({
        icon: 'warning', title: 'Campos incompletos', text: 'Por favor, ingresa tu usuario y contraseña.',
        confirmButtonColor: '#0f172a'
      });
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('op', 'new_login');
      formData.append('usermail', usermail);
      formData.append('password', password);

      const response = await fetch(`${apiHost}/Auth.php`, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.status === 'success') {
        await login(data.user.id, data.user.name, data.user.type, data.user.user);
        
        if (window?.electron?.checkForUpdates) window.electron.checkForUpdates();
        navigate('/home');
      } else {
        Swal.fire({
          icon: 'error', title: 'Acceso Denegado', text: data.message || 'Usuario o contraseña incorrectos.',
          confirmButtonColor: '#0f172a'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error', title: 'Error de Red', text: 'No se pudo conectar con el servidor. Revisa tu conexión.',
        confirmButtonColor: '#0f172a'
      });
    }
    setLoading(false);
  };

  return (
    <Box 
      sx={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundImage: `url(${fondo})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        '&::before': { 
          content: '""', 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)'
        }
      }}
    >
      <Paper 
        elevation={24} 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          width: '100%', 
          maxWidth: 420, 
          p: { xs: 4, sm: 5 }, 
          borderRadius: 4,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <Box component="img" src={logo} alt="IMA Express" sx={{ width: 200, mb: 4, objectFit: 'contain' }} />
        
        <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1} textAlign="center" letterSpacing="-0.02em">
          Bienvenido de nuevo
        </Typography>
        <Typography variant="body2" color="#64748b" mb={4} textAlign="center" fontWeight={500}>
          Ingresa tus credenciales para acceder a la plataforma.
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          
          <TextField 
            fullWidth variant="outlined" placeholder="Usuario" 
            value={usermail} onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94a3b8' }} /></InputAdornment>
            }}
          />

          <TextField 
            fullWidth type="password" variant="outlined" placeholder="Contraseña" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8' }} /></InputAdornment>
            }}
          />

          <Button 
            fullWidth type="submit" variant="contained" disableElevation
            disabled={loading}
            sx={{ 
              py: 1.5, 
              borderRadius: 2, 
              bgcolor: '#0f172a', 
              fontSize: '1rem', 
              fontWeight: 700,
              textTransform: 'none',
              transition: '0.2s',
              '&:hover': { bgcolor: '#1e293b', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)' }
            }}
          >
            {loading ? <CircularProgress size={26} sx={{ color: 'white' }} /> : 'Iniciar Sesión'}
          </Button>

        </Box>
      </Paper>
    </Box>
  );
};

export default Login;