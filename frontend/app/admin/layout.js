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
      <header className="bg-gradient-to-r from-[#1a1a2e] to-[#121626] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold font-['M_PLUS_Rounded_1c']">Charactier 管理画面</h1>
          
          <button
            onClick={handleLogout}
            className="text-white hover:bg-white/10 px-3 py-1 rounded transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="flex flex-1">
        {/* サイドバー */}
        <aside className="w-64 bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] text-white p-4 shadow-lg">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className={`block p-2 rounded transition-colors ${
                    pathname === '/admin/dashboard' 
                    ? 'bg-gradient-to-r from-[#43eafc]/20 to-[#fa7be6]/20 text-white' 
                    : 'hover:bg-white/10'
                  }`}
                >
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className={`block p-2 rounded transition-colors ${
                    pathname === '/admin/users' 
                    ? 'bg-gradient-to-r from-[#43eafc]/20 to-[#fa7be6]/20 text-white' 
                    : 'hover:bg-white/10'
                  }`}
                >
                  ユーザー管理
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/characters"
                  className={`block p-2 rounded transition-colors ${
                    pathname.startsWith('/admin/characters') 
                    ? 'bg-gradient-to-r from-[#43eafc]/20 to-[#fa7be6]/20 text-white' 
                    : 'hover:bg-white/10'
                  }`}
                >
                  キャラクター管理
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* メインコンテンツエリア */}
        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
