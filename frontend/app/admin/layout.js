'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '../utils/adminAuth';
import Link from 'next/link';

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
    <div className="admin-root">
      {/* ヘッダー */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <h1 className="admin-header-title">Charactier 管理画面</h1>
          <button onClick={handleLogout} className="admin-logout-btn">ログアウト</button>
        </div>
      </header>
      <div className="admin-content">
        {/* サイドバー */}
        <aside className="admin-sidebar">
          <nav>
            <ul>
              <li>
                <Link href="/admin/dashboard" className={pathname === '/admin/dashboard' ? 'active' : ''}>ダッシュボード</Link>
              </li>
              <li>
                <Link href="/admin/users" className={pathname === '/admin/users' ? 'active' : ''}>ユーザー管理</Link>
              </li>
              <li>
                <Link href="/admin/characters" className={pathname.startsWith('/admin/characters') ? 'active' : ''}>キャラクター管理</Link>
              </li>
            </ul>
          </nav>
        </aside>
        {/* メインコンテンツエリア */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
