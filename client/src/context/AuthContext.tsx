import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: number;
  email: string;
  name?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/api/auth/me');
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data && data.user) {
      setUser(data.user);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    if (data && data.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
