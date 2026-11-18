import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { version } from '../package.json';
import { instalarIdentidad } from './shared/api';
import { API_BASE } from './shared/config/env';
import { useAuthStore } from './store/useAuthStore';

instalarIdentidad({
  apiHost: API_BASE,
  app: `Desktop ${version}`,
  obtenerUsuario: () => useAuthStore.getState().user?.id,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
