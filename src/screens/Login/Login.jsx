import React, { useContext, useState } from 'react';
import './Login.css';
import { AuthContext } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import fondo from '../../assets/images/hero.jpg';
import logo from '../../assets/images/logo.png';

const Login = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [usermail, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usermail || !password) {
      alert('Por favor, ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('op', 'login');
      formData.append('usermail', usermail);
      formData.append('password', password);

      const response = await fetch(`${apiHost}/Auth.php`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log("respuesta" + text);
      const data = JSON.parse(text);

      if (data.status === 'success') {
        console.log(data.user.type);
        await login(data.user.id, data.user.name, data.user.type);

        if (window?.electron?.checkForUpdates) {
          window.electron.checkForUpdates();
        }

        navigate('/home');
      }
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
      console.error(error);
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
