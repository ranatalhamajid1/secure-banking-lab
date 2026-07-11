import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import bankingEvents from '../utils/eventDispatcher';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutCalledRef = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for unauthorized event from axios interceptor
    const handleUnauthorized = () => {
      if (logoutCalledRef.current) return;
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    // If 2FA is required, return immediately – caller handles it
    if (response.data.requires2FA) {
      return response.data;
    }

    // Fetch the full user profile (balance, role, hasTransferPin, etc.)
    await fetchUser();
    logoutCalledRef.current = false;
    bankingEvents.emit('auth:login');
    return response.data;
  }, [fetchUser]);

  const logout = useCallback(async () => {
    if (logoutCalledRef.current) return; // prevent double logout
    logoutCalledRef.current = true;
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout API errors
    }
    setUser(null);
    bankingEvents.emit('auth:logout');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      // Retry once
      try {
        const retryResponse = await api.get('/auth/me');
        setUser(retryResponse.data.user);
      } catch (retryError) {
        // If still unauthorized, logout
        if (retryError.response?.status === 401) {
          logout();
        }
      }
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
