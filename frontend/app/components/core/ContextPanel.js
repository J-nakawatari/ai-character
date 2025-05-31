'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ContextPanel.module.css';

/**
 * ContextPanel - 階層化された状況認識型サイドパネル
 * 上段：全画面共通のナビゲーション
 * 下段：現在のページに固有の機能
 */
const ContextPanel = ({ 
  isOpen, 
  context, 
  user, 
  isAdmin, 
  onClose, 
  locale 
}) => {
  const router = useRouter();

  // 安全な文字列取得関数
  const getSafeString = (value, fallback = '') => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value[locale] || value.ja || value.en || fallback;
    }
    return String(value) || fallback;
  };

  // ESCキーでパネルを閉じる
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // 共通ナビゲーションの取得
  const getCommonNavigation = () => {
    if (isAdmin) {
      return [
        { href: '/admin/dashboard', icon: '📊', label: 'ダッシュボード' },
        { href: '/admin/users', icon: '👥', label: 'ユーザー管理' },
        { href: '/admin/characters', icon: '🤖', label: 'キャラクター管理' },
        { href: '/admin/settings', icon: '⚙️', label: 'システム設定' }
      ];
    } else {
      return [
        { href: `/${locale}/dashboard`, icon: '🏠', label: 'ホーム' },
        { href: `/${locale}/chat`, icon: '💬', label: 'チャット' },
        { href: `/${locale}/setup`, icon: '✨', label: 'キャラクター選択' },
        { href: `/${locale}/mypage`, icon: '👤', label: 'マイページ' }
      ];
    }
  };

  // ページ固有機能の取得
  const getContextSpecificContent = () => {
    switch (context) {
      case 'chat':
        return (
          <>
            <div className={styles.section}>
              <h4>チャット機能</h4>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn}>💭 新しい会話</button>
                <button className={styles.actionBtn}>📝 会話履歴</button>
                <button className={styles.actionBtn}>⚙️ チャット設定</button>
                <button className={styles.actionBtn}>❤️ お気に入り</button>
              </div>
            </div>

            {!user?.selectedCharacter && (
              <div className={styles.section}>
                <h4>キャラクター選択</h4>
                <Link 
                  href={`/${locale}/setup`}
                  className={styles.selectCharacter}
                >
                  キャラクターを選択
                </Link>
              </div>
            )}
          </>
        );

      case 'overview':
        return (
          <>
            {!isAdmin && (
              <div className={styles.section}>
                <h4>最近の活動</h4>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>💬</span>
                    <span className={styles.activityText}>チャット履歴</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>⭐</span>
                    <span className={styles.activityText}>お気に入り</span>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case 'character-management':
      case 'user-management':
        return (
          <>
            <div className={styles.section}>
              <h4>{context === 'character-management' ? 'キャラクター管理' : 'ユーザー管理'}</h4>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn}>➕ 新規作成</button>
                <button className={styles.actionBtn}>📁 インポート</button>
                <button className={styles.actionBtn}>📤 エクスポート</button>
                <button className={styles.actionBtn}>🗑️ 一括削除</button>
              </div>
            </div>

            <div className={styles.section}>
              <h4>フィルター</h4>
              <div className={styles.filterList}>
                <label className={styles.filterItem}>
                  <input type="checkbox" />
                  アクティブのみ
                </label>
                <label className={styles.filterItem}>
                  <input type="checkbox" />
                  最近更新
                </label>
                <label className={styles.filterItem}>
                  <input type="checkbox" />
                  お気に入り
                </label>
              </div>
            </div>
          </>
        );

      case 'character-selection':
        return (
          <>
            <div className={styles.section}>
              <h4>フィルター</h4>
              <div className={styles.filterTags}>
                <button className={styles.filterTag}>🆓 無料</button>
                <button className={styles.filterTag}>💎 プレミアム</button>
                <button className={styles.filterTag}>⭐ 人気</button>
                <button className={styles.filterTag}>🆕 新着</button>
              </div>
            </div>

            <div className={styles.section}>
              <h4>カテゴリ</h4>
              <div className={styles.categoryList}>
                <button className={styles.categoryItem}>👥 友達</button>
                <button className={styles.categoryItem}>💼 アシスタント</button>
                <button className={styles.categoryItem}>🎭 エンターテイナー</button>
                <button className={styles.categoryItem}>📚 学習サポート</button>
              </div>
            </div>
          </>
        );

      case 'profile':
        return (
          <>
            <div className={styles.section}>
              <h4>プロフィール設定</h4>
              <div className={styles.navigation}>
                <Link href={`/${locale}/mypage`} className={styles.navItem}>
                  👤 基本情報
                </Link>
                <Link href={`/${locale}/mypage#security`} className={styles.navItem}>
                  🔒 セキュリティ
                </Link>
                <Link href={`/${locale}/mypage#preferences`} className={styles.navItem}>
                  ⚙️ 設定
                </Link>
                <Link href={`/${locale}/mypage#billing`} className={styles.navItem}>
                  💳 請求情報
                </Link>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const commonNavigation = getCommonNavigation();
  const contextContent = getContextSpecificContent();

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* パネル本体 */}
      <div className={`${styles.contextPanel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.panelHeader}>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.panelContent}>
          {/* 上段：共通ナビゲーション */}
          <div className={styles.commonSection}>
            <h3 className={styles.sectionTitle}>
              {isAdmin ? '管理機能' : 'メニュー'}
            </h3>
            <div className={styles.navigation}>
              {commonNavigation.map((item, index) => (
                <Link key={index} href={item.href} className={styles.navItem}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 下段：ページ固有機能 */}
          {contextContent && (
            <div className={styles.contextSection}>
              <div className={styles.sectionDivider}></div>
              {contextContent}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContextPanel;