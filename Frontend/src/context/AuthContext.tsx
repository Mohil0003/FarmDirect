import React, { createContext, useState, useContext } from 'react';
import { logout as apiLogout } from '../services/authService';

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize user from localStorage on mount
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return {
          userId: parsedUser.userId,
          name: parsedUser.fullName || parsedUser.name,
          email: parsedUser.email,
          role: parsedUser.role,
          token: token,
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (userData: User) => {
    setUser(userData);
    // Store in localStorage (handled by authService, but ensure consistency)
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      userId: userData.userId,
      fullName: userData.name,
      email: userData.email,
      role: userData.role,
    }));
  };

  const logout = () => {
    setUser(null);
    apiLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};