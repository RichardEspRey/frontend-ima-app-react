import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState({});

  // Función para obtener permisos del usuario desde el servidor
  const fetchUserPermissions = useCallback(async (userID) => {
        if (!userID) return;

        const formData = new FormData();
        formData.append('op', 'getUserPermissions');
        formData.append('user_id', userID);

        try {
            const response = await fetch(`${apiHost}/AccessManager.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                setUserPermissions(prev => {
                    const newPermissions = data.permissions || {};
                    if (JSON.stringify(prev) !== JSON.stringify(newPermissions)) {
                        return newPermissions;
                    }
                    return prev;
                });
            } else {
                console.error("Error al obtener permisos:", data.message);
            }
        } catch (error) {
            console.error('Error de conexión al obtener permisos:', error);
        }
    }, [apiHost]);

  // Comprobar inicio de sesión y cargar permisos iniciales
  useEffect(() => {
    const checkLoginStatus = () => {
      const id = localStorage.getItem('userID');
      const name = localStorage.getItem('userName');
      const type = localStorage.getItem('type');
      const email = localStorage.getItem('userEmail');

      if (id && name && type && email) {
        const userData = { id, name, tipo_usuario: type, email: email };
        setUser(userData);
        fetchUserPermissions(id);
      }

      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  // Polling para actualización en tiempo real de permisos
  useEffect(() => {
        let intervalId;
        const POLLING_INTERVAL = 15000;

        if (user && user.id) {
            // Establecer el intervalo de sondeo
            intervalId = setInterval(() => {
                fetchUserPermissions(user.id);
            }, POLLING_INTERVAL);
        }

        // Función de limpieza: detener el polling al desmontar o desloguear
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
  }, [user, fetchUserPermissions]);

  const login = (id, name, type, email) => {
    localStorage.setItem('userID', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('type', type);
    localStorage.setItem('userEmail', email);
    const userData = { id, name, tipo_usuario: type, email };
    setUser(userData);
    fetchUserPermissions(id);
  };

  const logout = () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    localStorage.removeItem('type');
    localStorage.removeItem('userEmail');
    setUser(null);
    setUserPermissions({});
  };

  return (
    <AuthContext.Provider value={{ user, userPermissions, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};