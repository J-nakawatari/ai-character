'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth, AdminAuthProvider } from '@/utils/adminAuth';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}

function AdminLayoutInner({ children }) {
  const { admin, loading, adminLogout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname.endsWith('/admin/login');
  
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
    <DashboardLayout
      isAdmin={true}
      user={admin}
      onLogout={handleLogout}
      locale="ja"
    >
      {children}
    </DashboardLayout>
  );
} 