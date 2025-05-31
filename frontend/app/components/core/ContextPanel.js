'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ContextPanel.module.css';

/**
 * ContextPanel - 状況に応じて変化するサイドパネル
 * 従来の固定サイドバーではなく、現在の作業に最適化された機能を提供
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

  // コンテキストに応じた内容を生成
  const renderContextContent = () => {
    switch (context) {
      case 'chat':
        return (
          <div className={styles.contextContent}>
            <h3 className={styles.sectionTitle}>チャット機能</h3>
            
            <div className={styles.section}>
              <h4>現在のキャラクター</h4>
              {user?.selectedCharacter ? (
                <div className={styles.characterCard}>
                  <div className={styles.characterAvatar}>
                    {user.selectedCharacter.imageChatAvatar ? (
                      <img src={user.selectedCharacter.imageChatAvatar} alt="キャラクター" />
                    ) : (
                      '🤖'
                    )}
                  </div>
                  <div className={styles.characterInfo}>
                    <p className={styles.characterName}>
                      {typeof user.selectedCharacter.name === 'object' 
                        ? user.selectedCharacter.name[locale] 
                        : user.selectedCharacter.name}
                    </p>
                    <Link 
                      href={`/${locale}/setup?reselect=true`}
                      className={styles.changeCharacter}
                    >
                      キャラクター変更
                    </Link>
                  </div>
                </div>
              ) : (
                <Link 
                  href={`/${locale}/setup`}
                  className={styles.selectCharacter}
                >
                  キャラクターを選択
                </Link>
              )}
            </div>

            <div className={styles.section}>
              <h4>クイックアクション</h4>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn}>💭 新しい会話</button>
                <button className={styles.actionBtn}>📝 会話履歴</button>
                <button className={styles.actionBtn}>⚙️ チャット設定</button>
                <button className={styles.actionBtn}>❤️ お気に入り</button>
              </div>
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className={styles.contextContent}>
            <h3 className={styles.sectionTitle}>
              {isAdmin ? '管理機能' : 'ナビゲーション'}
            </h3>
            
            <div className={styles.navigation}>
              {isAdmin ? (
                <>
                  <Link href="/admin/dashboard" className={styles.navItem}>
                    📊 ダッシュボード
                  </Link>
                  <Link href="/admin/users" className={styles.navItem}>
                    👥 ユーザー管理
                  </Link>
                  <Link href="/admin/characters" className={styles.navItem}>
                    🤖 キャラクター管理
                  </Link>
                  <Link href="/admin/settings" className={styles.navItem}>
                    ⚙️ システム設定
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/dashboard`} className={styles.navItem}>
                    🏠 ホーム
                  </Link>
                  <Link href={`/${locale}/chat`} className={styles.navItem}>
                    💬 チャット
                  </Link>
                  <Link href={`/${locale}/setup`} className={styles.navItem}>
                    ✨ キャラクター選択
                  </Link>
                  <Link href={`/${locale}/mypage`} className={styles.navItem}>
                    👤 マイページ
                  </Link>
                </>
              )}
            </div>

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
          </div>
        );

      case 'character-management':
      case 'user-management':
        return (
          <div className={styles.contextContent}>
            <h3 className={styles.sectionTitle}>
              {context === 'character-management' ? 'キャラクター管理' : 'ユーザー管理'}
            </h3>
            
            <div className={styles.section}>
              <h4>アクション</h4>
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
          </div>
        );

      case 'character-selection':
        return (
          <div className={styles.contextContent}>
            <h3 className={styles.sectionTitle}>キャラクター選択</h3>
            
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
          </div>
        );

      case 'profile':
        return (
          <div className={styles.contextContent}>
            <h3 className={styles.sectionTitle}>プロフィール設定</h3>
            
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
        );

      default:
        return (
          <div className={styles.contextContent}>
            <h3 className={styles.sectionTitle}>メニュー</h3>
            <div className={styles.navigation}>
              <Link href={`/${locale}/dashboard`} className={styles.navItem}>
                🏠 ホーム
              </Link>
              <Link href={`/${locale}/chat`} className={styles.navItem}>
                💬 チャット
              </Link>
            </div>
          </div>
        );
    }
  };

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
          {renderContextContent()}
        </div>
      </div>
    </>
  );
};

export default ContextPanel;