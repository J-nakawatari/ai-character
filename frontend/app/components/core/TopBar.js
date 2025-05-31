'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './TopBar.module.css';

/**
 * TopBar - コンテキスト認識型のトップバー
 * 現在の作業に最適化された情報とアクションを表示
 */
const TopBar = ({ 
  user, 
  isAdmin, 
  onLogout, 
  currentContext, 
  onContextToggle,
  locale 
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // コンテキストに応じたタイトルとアクション
  const getContextInfo = () => {
    switch (currentContext) {
      case 'chat':
        return {
          title: user?.selectedCharacter?.name || 'チャット',
          subtitle: 'AIとの会話',
          actions: ['character-switch', 'settings']
        };
      case 'overview':
        return {
          title: isAdmin ? '管理ダッシュボード' : 'ホーム',
          subtitle: isAdmin ? 'システム概要' : 'あなたの活動',
          actions: ['refresh', 'help']
        };
      case 'character-management':
        return {
          title: 'キャラクター管理',
          subtitle: 'AIキャラクターの設定',
          actions: ['add-character', 'import']
        };
      case 'user-management':
        return {
          title: 'ユーザー管理',
          subtitle: 'ユーザーアカウント管理',
          actions: ['add-user', 'export']
        };
      case 'character-selection':
        return {
          title: 'キャラクター選択',
          subtitle: '会話するキャラクターを選択',
          actions: ['preview', 'favorites']
        };
      case 'profile':
        return {
          title: 'プロフィール',
          subtitle: 'アカウント設定',
          actions: ['edit', 'security']
        };
      default:
        return {
          title: 'Character AI',
          subtitle: '人工知能との対話',
          actions: []
        };
    }
  };

  const contextInfo = getContextInfo();

  return (
    <header className={styles.topBar}>
      {/* 左側：コンテキスト情報 */}
      <div className={styles.contextSection}>
        <button 
          className={styles.contextToggle}
          onClick={onContextToggle}
          title="メニューを開く"
        >
          <span className={styles.hamburger}></span>
        </button>
        
        <div className={styles.contextInfo}>
          <h1 className={styles.contextTitle}>{contextInfo.title}</h1>
          <p className={styles.contextSubtitle}>{contextInfo.subtitle}</p>
        </div>
      </div>

      {/* 中央：クイック検索（必要に応じて） */}
      <div className={styles.centerSection}>
        {(currentContext === 'character-management' || currentContext === 'user-management') && (
          <div className={styles.quickSearch}>
            <input 
              type="text" 
              placeholder="検索..." 
              className={styles.searchInput}
            />
          </div>
        )}
      </div>

      {/* 右側：ユーザー情報とアクション */}
      <div className={styles.userSection}>
        {/* 通知（管理者のみ） */}
        {isAdmin && (
          <button className={styles.notificationBtn} title="通知">
            <span className={styles.notificationIcon}>🔔</span>
            <span className={styles.notificationBadge}>3</span>
          </button>
        )}

        {/* ユーザーメニュー */}
        <div className={styles.userMenu}>
          <button 
            className={styles.userButton}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || '👤'}</span>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'ゲスト'}</span>
              <span className={styles.userRole}>
                {isAdmin ? '管理者' : 'ユーザー'}
              </span>
            </div>
          </button>

          {/* ドロップダウンメニュー */}
          {userMenuOpen && (
            <div className={styles.dropdown}>
              <Link href={`/${locale}/mypage`} className={styles.dropdownItem}>
                👤 プロフィール
              </Link>
              <Link href={`/${locale}/dashboard`} className={styles.dropdownItem}>
                🏠 ダッシュボード
              </Link>
              <div className={styles.dropdownDivider}></div>
              <button 
                className={styles.dropdownItem}
                onClick={onLogout}
              >
                🚪 ログアウト
              </button>
            </div>
          )}
        </div>
      </div>

      {/* オーバーレイ */}
      {userMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default TopBar;