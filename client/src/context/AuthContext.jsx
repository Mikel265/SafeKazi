import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getAuthToken, setAuthToken, removeAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/auth/me');
      if (data.success) {
        setUser(data.user);
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success) {
      setAuthToken(data.token);
      setUser(data.user);
      return data;
    }
  };

  const register = async (name, email, phone, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });

    if (data.success) {
      setAuthToken(data.token);
      setUser(data.user);
      return data;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
