import React, { useState } from 'react';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import fondo from '../../assets/images/hero.jpg';
import logo from '../../assets/images/logo.png';
import { useAuthStore } from '../../store/useAuthStore';

const Login = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [usermail, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usermail || !password) return alert('Ingresa usuario y contraseña.');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('op', 'login');
      formData.append('usermail', usermail);
      formData.append('password', password);

      const response = await fetch(`${apiHost}/Auth.php`, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.status === 'success') {
        await login(data.user.id, data.user.name, data.user.type, data.user.email);
        if (window?.electron?.checkForUpdates) window.electron.checkForUpdates();
        navigate('/home');
      } else {
        alert(data.message || 'Error de credenciales');
      }
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    }
    setLoading(false);
  };

  return (
    <div className="loginBackground" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="loginOverlay">
        <div className="logoContainer">
          <img src={logo} alt="Logo" className="loginLogo" />
        </div>

        <div className="inputGroup">
          <FontAwesomeIcon icon={faUser} className="fa-solid fa-user fa-xl" />
          <input
            type="text"
            placeholder="Usuario"
            value={usermail}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="inputGroup">
          <FontAwesomeIcon icon={faLock} className="fa-solid fa-user fa-xl" />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="loginButton" onClick={handleLogin} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  );
};

export default Login;
