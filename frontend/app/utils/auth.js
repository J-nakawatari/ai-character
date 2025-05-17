'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Attempting to load user profile...');
        const res = await api.get('/auth/user');
        console.log('User loaded successfully:', res.data);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user:', err);
        console.log('Response status:', err.response?.status);
        console.log('Response data:', err.response?.data);
        setUser(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err);
      return { 
        success: false, 
        error: err.response?.data?.msg || 'Registration failed' 
      };
    }
  };

  const login = async (userData) => {
    try {
      console.log('Attempting login...');
      const res = await api.post('/auth/login', userData);
      console.log('Login response:', res.data);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        console.log('Fetching user data after login...');
        const userRes = await api.get('/auth/user');
        console.log('User data fetched:', userRes.data);
        setUser(userRes.data);
      } catch (userErr) {
        console.error('Failed to fetch user after login:', userErr);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      return { 
        success: false, 
        error: err.response?.data?.msg || 'Login failed' 
      };
    }
  };

  const completeSetup = async (setupData) => {
    try {
      console.log('Completing setup with data:', setupData);
      const res = await api.put('/users/setup', setupData);
      console.log('Setup completed successfully, user data:', res.data);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      console.error('Setup failed:', err);
      console.log('Response status:', err.response?.status);
      console.log('Response data:', err.response?.data);
      return { 
        success: false, 
        error: err.response?.data?.msg || 'Setup failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Logout failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        completeSetup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
