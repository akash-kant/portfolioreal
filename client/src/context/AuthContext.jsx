import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const { isLoading } = useQuery('user', () => api.get('/auth/me').then((r) => r.data.data), {
    enabled: !!token,
    onSuccess: (data) => setUser(data),
    onError: () => logout(),
  });

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    queryClient.invalidateQueries('user');
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    queryClient.invalidateQueries('user');
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
    queryClient.removeQueries('user');
  };

  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  const value = { user, token, login, register, logout, isLoading, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
