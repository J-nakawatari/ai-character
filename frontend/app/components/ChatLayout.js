'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ChatLayout.module.css';

const ChatLayout = ({ 
  children,
  user,
  onLogout,
  locale = 'ja'
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
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

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  return (
    <div className={styles.chatLayout}>
      {/* フローティングナビゲーションボタン */}
      <button 
        className={styles.floatingNavBtn}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* スライドメニュー */}
      {isMenuOpen && (
        <>
          <div 
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={styles.slideMenu}>
            <div className={styles.menuHeader}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.[0]?.toUpperCase() || '👤'}</span>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{user?.name}</div>
                  <div className={styles.userRole}>ユーザー</div>
                </div>
              </div>
            </div>
            
            <nav className={styles.menuNav}>
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={styles.menuItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className={styles.menuFooter}>
              <button 
                className={styles.menuLogoutBtn}
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <span className={styles.menuIcon}>🚪</span>
                <span className={styles.menuLabel}>ログアウト</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* チャットコンテンツ */}
      <div className={styles.chatContent}>
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;