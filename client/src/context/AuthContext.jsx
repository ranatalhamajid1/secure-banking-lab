import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Listen for unauthorized event from axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {

    let inactivityTimer;
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (user) {
        // 5 minutes (300,000 ms)
        inactivityTimer = setTimeout(() => {
          logout();
        }, 5 * 60 * 1000);
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => {
      resetTimer();
    };

    if (user) {
      events.forEach(e => window.addEventListener(e, handleActivity));
      resetTimer();
    }

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [user]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    await fetchUser();
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
