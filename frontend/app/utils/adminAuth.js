'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        console.log('管理者プロフィールの読み込み中...');
        const res = await api.get('/admin/auth/user');
        console.log('管理者データ:', res.data);
        setAdmin(res.data);
      } catch (err) {
        console.error('管理者データの読み込みに失敗:', err);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  const adminLogin = async (adminData) => {
    try {
      console.log('管理者ログイン試行中...', adminData.email);
      const res = await api.post('/admin/auth/login', adminData);
      console.log('ログイン結果:', res.data);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        console.log('ログイン後の管理者データ取得中...');
        const adminRes = await api.get('/admin/auth/user');
        console.log('管理者データ:', adminRes.data);
        setAdmin(adminRes.data);
      } catch (adminErr) {
        console.error('ログイン後の管理者データ取得に失敗:', adminErr);
        console.error('エラー詳細:', adminErr.response?.data);
      }
      
      return { success: true };
    } catch (err) {
      console.error('管理者ログイン失敗:', err);
      console.error('エラー詳細:', err.response?.data);
      return { 
        success: false, 
        error: err.response?.data?.msg || 'ログイン失敗' 
      };
    }
  };

  const adminLogout = async () => {
    try {
      await api.post('/admin/auth/logout');
      setAdmin(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'ログアウト失敗' };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
