import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = () => {
      const id = localStorage.getItem('userID');
      const name = localStorage.getItem('userName');
      const type = localStorage.getItem('type');

      if (id && name && type) {
        setUser({ id, name, tipo_usuario: type });
      }

      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  const login = (id, name, type) => {
    localStorage.setItem('userID', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('type', type);
    setUser({ id, name, tipo_usuario: type });
  };

  const logout = () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    localStorage.removeItem('type');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
