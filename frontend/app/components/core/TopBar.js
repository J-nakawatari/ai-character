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

  // 多言語対応の名前取得関数
  const getCharacterName = (characterName) => {
    if (!characterName) return 'チャット';
    if (typeof characterName === 'string') return characterName;
    if (typeof characterName === 'object') {
      return characterName[locale] || characterName.ja || characterName.en || 'チャット';
    }
    return 'チャット';
  };

  // 安全な文字列取得関数
  const getSafeString = (value, fallback = '') => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value[locale] || value.ja || value.en || fallback;
    }
    return String(value) || fallback;
  };

  // コンテキストに応じたタイトルとアクション
  const getContextInfo = () => {
    switch (currentContext) {
      case 'chat':
        return {
          title: getCharacterName(user?.selectedCharacter?.name),
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
          <svg 
            className={styles.hamburger}
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M3 6h18M3 12h18M3 18h18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <div className={styles.contextInfo}>
          <h1 className={styles.contextTitle}>{contextInfo.title}</h1>
          <p className={styles.contextSubtitle}>{contextInfo.subtitle}</p>
        </div>

        {/* チャット画面でのキャラクター情報と親密度 */}
        {currentContext === 'chat' && user?.selectedCharacter && (
          <div className={styles.chatInfo}>
            <div className={styles.characterAvatar}>
              {user.selectedCharacter.imageChatAvatar ? (
                <img 
                  src={user.selectedCharacter.imageChatAvatar} 
                  alt={getSafeString(user.selectedCharacter.name, 'キャラクター')}
                  className={styles.characterImage}
                />
              ) : (
                <span className={styles.characterEmoji}>🤖</span>
              )}
            </div>
            <div className={styles.affinityDisplay}>
              <div className={styles.affinityLevel}>
                <span className={styles.affinityLabel}>親密度</span>
                <span className={styles.affinityValue}>{user.selectedCharacter.affinity || 0}</span>
                <span className={styles.affinityMax}>/100</span>
              </div>
              <div className={styles.affinityBar}>
                <div 
                  className={styles.affinityProgress}
                  style={{ width: `${(user.selectedCharacter.affinity || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 中央：管理者向けクイックナビ / チャット画面では空 */}
      <div className={styles.centerSection}>
        {isAdmin && currentContext !== 'chat' && (
          <div className={styles.quickNav}>
            <Link href="/admin/dashboard" className={styles.quickNavItem}>
              📊 ダッシュボード
            </Link>
            <Link href="/admin/characters" className={styles.quickNavItem}>
              🤖 キャラクター
            </Link>
            <Link href="/admin/users" className={styles.quickNavItem}>
              👥 ユーザー
            </Link>
            <Link href="/admin/settings" className={styles.quickNavItem}>
              ⚙️ 設定
            </Link>
          </div>
        )}
        
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
                <img src={user.avatar} alt={getSafeString(user.name, 'ユーザー')} />
              ) : (
                <span>{getSafeString(user?.name, '👤')?.[0]?.toUpperCase() || '👤'}</span>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{getSafeString(user?.name, 'ゲスト')}</span>
              <span className={styles.userRole}>
                {isAdmin ? '管理者' : 'ユーザー'}
              </span>
            </div>
          </button>

          {/* ドロップダウンメニュー */}
          {userMenuOpen && (
            <div className={styles.dropdown}>
              {isAdmin ? (
                <>
                  <Link href="/admin/dashboard" className={styles.dropdownItem}>
                    📊 管理ダッシュボード
                  </Link>
                  <Link href="/admin/settings" className={styles.dropdownItem}>
                    ⚙️ システム設定
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/mypage`} className={styles.dropdownItem}>
                    👤 プロフィール
                  </Link>
                  <Link href={`/${locale}/dashboard`} className={styles.dropdownItem}>
                    🏠 ダッシュボード
                  </Link>
                </>
              )}
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