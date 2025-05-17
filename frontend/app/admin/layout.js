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
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Charactier 管理画面</h1>
          
          <button
            onClick={handleLogout}
            className="text-white hover:underline"
          >
            ログアウト
          </button>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="flex flex-1">
        {/* サイドバー */}
        <aside className="w-64 bg-gray-800 text-white p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className={`block p-2 rounded ${
                    pathname === '/admin/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className={`block p-2 rounded ${
                    pathname === '/admin/users' ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  ユーザー管理
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/characters"
                  className={`block p-2 rounded ${
                    pathname.startsWith('/admin/characters') ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  キャラクター管理
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* メインコンテンツエリア */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
