import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authsphere_token'));
  const [checkingAuth, setCheckingAuth] = useState(Boolean(localStorage.getItem('authsphere_token')));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('authsphere_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('authsphere_token', token);
    } else {
      localStorage.removeItem('authsphere_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authsphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('authsphere_user');
    }
  }, [user]);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (_error) {
        setToken(null);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifySession();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_error) {
      // Local logout should still complete if the server token is already expired.
    }

    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, checkingAuth, isAuthenticated: Boolean(token), login, register, logout, updateUser }),
    [token, user, checkingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
