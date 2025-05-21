'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '../utils/adminAuth';
import Link from 'next/link';
import SidebarShadcn from "../components/SidebarShadcn";

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
      <SidebarShadcn onLogout={handleLogout} />
      {children}
    </div>
  );
}
