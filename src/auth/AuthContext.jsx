
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = localStorage.getItem('userID');
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  const login = (id, name) => {
    localStorage.setItem('userID', id);
    localStorage.setItem('userName', name);
    setUser(id);
  };

  const logout = () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
