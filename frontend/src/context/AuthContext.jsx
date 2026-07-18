import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setOrganization(res.data.organization);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('saas_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('saas_token', res.data.token);
      await fetchProfile();
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password, organizationName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, organizationName });
      localStorage.setItem('saas_token', res.data.token);
      await fetchProfile();
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_token');
    setUser(null);
    setOrganization(null);
    setLoading(false);
  };

  const seedAcmeCorp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/seed');
      // Login with owner by default after seeding
      const loginRes = await api.post('/auth/login', {
        email: 'owner@acme.com',
        password: 'alice123',
      });
      localStorage.setItem('saas_token', loginRes.data.token);
      await fetchProfile();
      return res.data.message;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Seeding failed.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setOrganization(res.data.organization);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        error,
        login,
        register,
        logout,
        seedAcmeCorp,
        refreshProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
