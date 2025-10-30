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
      const email = localStorage.getItem('userEmail');

      if (id && name && type && email) {
        setUser({ id, name, tipo_usuario: type, email: email });
      }

      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  const login = (id, name, type, email) => {
    localStorage.setItem('userID', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('type', type);
    localStorage.setItem('userEmail', email);
    setUser({ id, name, tipo_usuario: type, email });
  };

  const logout = () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    localStorage.removeItem('type');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};