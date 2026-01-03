// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { apiService, User } from '../services/api';
import { wsService } from '../services/websocket';
import { useError } from './ErrorContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  streamToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (privyToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (token) {
      wsService.connect(token);
    }

    return () => {
      wsService.disconnect();
    };
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser, storedStreamToken] = await Promise.all([
        apiService.getStoredToken(),
        apiService.getStoredUser(),
        apiService.getStreamToken(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setStreamToken(storedStreamToken);

        // Verify token is still valid by fetching user profile
        try {
          const freshUser = await apiService.getMe();
          setUser(freshUser);
        } catch (error) {
          // Token expired, clear auth
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (privyToken: string) => {
    try {
      setLoading(true);
      const { token: newToken, user: newUser, streamToken: newStreamToken } = 
        await apiService.login(privyToken);
      
      setToken(newToken);
      setUser(newUser);
      setStreamToken(newStreamToken);
    } catch (error) {
      showError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearAuth();
    } catch (error) {
      showError(error as Error);
    }
  };

  const clearAuth = async () => {
    await apiService.clearAuth();
    wsService.disconnect();
    setToken(null);
    setUser(null);
    setStreamToken(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      apiService.setUser(updatedUser);
    }
  };

  const refreshAuth = async () => {
    try {
      const freshUser = await apiService.getMe();
      setUser(freshUser);
    } catch (error) {
      showError(error as Error);
      await clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        streamToken,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};