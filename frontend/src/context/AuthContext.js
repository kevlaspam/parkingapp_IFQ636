import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [localMode, setLocalMode] = useState(() => {
    return localStorage.getItem('local_test_mode') === 'true';
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleLocalMode = () => {
    const nextVal = !localMode;
    setLocalMode(nextVal);
    localStorage.setItem('local_test_mode', String(nextVal));
    window.dispatchEvent(new Event('localModeChanged'));
  };

  // Force local mode on — used by built-in demo accounts (admin/admin, student/student)
  const forceLocalMode = () => {
    setLocalMode(true);
    localStorage.setItem('local_test_mode', 'true');
    window.dispatchEvent(new Event('localModeChanged'));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, localMode, toggleLocalMode, forceLocalMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
