'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './ModernLayout.module.css';

const ModernLayout = ({ 
  children, 
  isAdmin = false,
  user,
  onLogout,
  locale = 'ja',
  showSidebar = true
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // モバイルメニュー制御
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ナビゲーションアイテム
  const adminNavItems = [
    {
      href: '/admin/dashboard',
      label: 'ダッシュボード',
      icon: '📊'
    },
    {
      href: '/admin/users',
      label: 'ユーザー管理',
      icon: '👥'
    },
    {
      href: '/admin/characters',
      label: 'キャラクター管理',
      icon: '🤖'
    },
    {
      href: '/admin/settings',
      label: 'システム設定',
      icon: '⚙️'
    }
  ];

  const userNavItems = [
    {
      href: `/${locale}/dashboard`,
      label: 'ダッシュボード',
      icon: '🏠'
    },
    {
      href: `/${locale}/chat`,
      label: 'チャット',
      icon: '💬'
    },
    {
      href: `/${locale}/setup?reselect=true`,
      label: 'キャラクター選択',
      icon: '✨'
    },
    {
      href: `/${locale}/mypage`,
      label: 'マイページ',
      icon: '👤'
    }
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  const isActive = (href) => {
    if (href.includes('chat') && pathname.includes('chat')) return true;
    return pathname.startsWith(href);
  };

  if (!showSidebar) {
    return (
      <div className={styles.fullLayout}>
        {children}
      </div>
    );
  }

  return (
    <div className={styles.modernLayout}>
      {/* モバイルオーバーレイ */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        {/* ロゴ・ヘッダー */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🤖</span>
            {!isCollapsed && (
              <span className={styles.logoText}>Character AI</span>
            )}
          </div>
          <button 
            className={styles.collapseBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className={isCollapsed ? '→' : '←'}</span>
          </button>
        </div>

        {/* ユーザー情報 */}
        {user && !isCollapsed && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name?.[0]?.toUpperCase() || '👤'}</span>
              )}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>
                {isAdmin ? '管理者' : 'ユーザー'}
              </div>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!isCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* ログアウト */}
        <div className={styles.sidebarFooter}>
          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            <span className={styles.navIcon}>🚪</span>
            {!isCollapsed && (
              <span className={styles.navLabel}>ログアウト</span>
            )}
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className={styles.main}>
        {/* トップバー */}
        <header className={styles.topBar}>
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            ☰
          </button>
          <div className={styles.topBarContent}>
            <h1 className={styles.pageTitle}>
              {pathname.includes('dashboard') && 'ダッシュボード'}
              {pathname.includes('chat') && 'チャット'}
              {pathname.includes('users') && 'ユーザー管理'}
              {pathname.includes('characters') && 'キャラクター管理'}
              {pathname.includes('setup') && 'キャラクター選択'}
              {pathname.includes('mypage') && 'マイページ'}
              {pathname.includes('settings') && 'システム設定'}
            </h1>
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;