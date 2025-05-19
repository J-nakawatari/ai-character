'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '../utils/adminAuth';
import Link from 'next/link';
import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  const { admin, loading, adminLogout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/admin/login';
  
  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [admin, loading, router, isLoginPage]);
  
  const handleLogout = async () => {
    const result = await adminLogout();
    if (result.success) {
      router.push('/admin/login');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  if (isLoginPage) {
    return children;
  }
  
  if (!admin) {
    return null;
  }
  
  return (
    <div className="app-layout">
      <Sidebar adminMode />
      <main className="app-main">
        {/* ヘッダー */}
        <header className="admin-header">
          <div className="admin-header-inner">
            <h1 className="admin-header-title">Charactier 管理画面</h1>
            <button onClick={handleLogout} className="admin-logout-btn">ログアウト</button>
          </div>
        </header>
        <div className="admin-content">
          {/* メインコンテンツエリア */}
          <main className="admin-main">
            {children}
          </main>
        </div>
      </main>
    </div>
  );
}
