import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken && storedUser && !authService.isTokenExpired()) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        authService.logout();
      }

      setIsLoading(false);
    };

    // Escuchar cambios en localStorage para detectar logout desde otros tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'copa-pymes-token' && !e.newValue) {
        setToken(null);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    initAuth();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};