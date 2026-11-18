import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // si tienes estilos globales
import { version } from '../package.json';
import { useAuthStore } from './store/useAuthStore';
import { instalarIdentidad } from './utils/identidadPeticiones';

instalarIdentidad({
  apiHost: import.meta.env.VITE_API_HOST,
  app: `Desktop ${version}`,
  obtenerUsuario: () => useAuthStore.getState().user?.id,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
