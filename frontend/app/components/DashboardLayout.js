'use client';

import { useState, useEffect } from 'react';
import ModernSidebar, { SidebarIcons } from './ModernSidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ 
  children, 
  isAdmin = false,
  user,
  onLogout,
  locale = 'ja' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // モバイルメニュー制御
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // サイドバーアイテムの設定
  const adminItems = [
    {
      href: '/admin/dashboard',
      label: 'ダッシュボード',
      icon: <SidebarIcons.Dashboard />
    },
    {
      href: '/admin/users',
      label: 'ユーザー管理',
      icon: <SidebarIcons.Users />
    },
    {
      href: '/admin/characters',
      label: 'キャラクター管理',
      icon: <SidebarIcons.Character />
    },
    {
      href: '/admin/settings',
      label: 'システム設定',
      icon: <SidebarIcons.Settings />
    }
  ];

  const userItems = [
    {
      href: `/${locale}/dashboard`,
      label: 'ダッシュボード',
      icon: <SidebarIcons.Dashboard />
    },
    {
      href: `/${locale}/chat`,
      label: 'チャット',
      icon: <SidebarIcons.Chat />
    },
    {
      href: `/${locale}/setup?reselect=true`,
      label: 'キャラクター選択',
      icon: <SidebarIcons.Setup />
    },
    {
      href: `/${locale}/mypage`,
      label: 'マイページ',
      icon: <SidebarIcons.MyPage />
    }
  ];

  const sidebarItems = isAdmin ? adminItems : userItems;

  return (
    <div className={styles.dashboardLayout}>
      {/* モバイルオーバーレイ */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* サイドバー */}
      <ModernSidebar
        items={sidebarItems}
        onLogout={onLogout}
        userInfo={user}
        isAdmin={isAdmin}
        locale={locale}
        isMobileOpen={isMobileMenuOpen}
      />

      {/* メインコンテンツエリア */}
      <div className={styles.mainContent}>
        {/* モバイルヘッダー */}
        <header className={styles.mobileHeader}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="メニューを開く"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M3 12h18m-9-9h9m-9 18h9" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={styles.mobileTitle}>
            <span className={styles.mobileLogoIcon}>🤖</span>
            Character AI
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;