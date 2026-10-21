import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext, useAuth } from './useAuth';

export { useAuth };

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    role: u.role || u.Role,
    Role: u.role || u.Role,
    fullName: u.fullName || u.FullName,
    FullName: u.fullName || u.FullName,
    userId: u.userId || u.UserID,
    UserID: u.userId || u.UserID,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success && res.profile) {
            setUser(normalizeUser(res.profile));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(normalizeUser(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(normalizeUser(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      const res = await api.getProfile();
      if (res.success && res.profile) {
        setUser(normalizeUser(res.profile));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
