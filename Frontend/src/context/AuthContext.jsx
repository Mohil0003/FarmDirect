import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // In a real app, this data comes from your Login API response (JWT Token)
  // For now, let's MOCK a logged-in Farmer to test
  const [user, setUser] = useState({
    name: 'Mohil Farmer',
    role: 'Farmer', // Try changing this to 'Admin' or 'Consumer' to test!
    token: 'xyz-fake-token'
  });

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);