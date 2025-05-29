'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import styles from './page.module.css';

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await api.get(`/admin/characters/${params.id}`);
        setCharacter(res.data);
      } catch (err) {
        setError('データ取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.characterDetailPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>読み込み中...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.characterDetailPage}>
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>
            ❌ {error}
          </div>
          <button 
            className={styles.errorButton}
            onClick={() => router.push('/admin/characters')}
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }
  
  if (!character) return null;

  const getAccessTypeBadge = (type) => {
    const badges = {
      free: { text: '無料', class: styles.badgeSuccess },
      subscription: { text: 'サブスク', class: styles.badgeWarning },
      purchaseOnly: { text: '買い切り', class: styles.badgeNeutral }
    };
    const badge = badges[type] || { text: type, class: styles.badgeNeutral };
    return <span className={`${styles.badge} ${badge.class}`}>{badge.text}</span>;
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`${styles.badge} ${isActive ? styles.badgeSuccess : styles.badgeError}`}>
        {isActive ? '✅ 有効' : '❌ 無効'}
      </span>
    );
  };

  return (
    <div className={styles.characterDetailPage}>
      <div className="admin-content">
        {/* ヘッダー */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>キャラクター詳細</h1>
              <div className={styles.headerMeta}>
                {getAccessTypeBadge(character.characterAccessType)}
                {getStatusBadge(character.isActive)}
                <span className={styles.idText}>
                  ID: {params.id}
                </span>
              </div>
            </div>
            <div className={styles.headerButtons}>
              <button 
                className={styles.editButton}
                onClick={() => router.push(`/admin/characters/${params.id}`)}
              >
                ✏️ 編集
              </button>
              <button 
                className={styles.backButton}
                onClick={() => router.push('/admin/characters')}
              >
                ← 一覧に戻る
              </button>
            </div>
          </div>
        </div>
        {/* メインコンテンツ */}
        <div className={styles.mainContent}>
          {/* キャラクター概要カード */}
          <div className={styles.overviewCard}>
            <div className={styles.overviewGrid}>
              {/* キャラクター画像 */}
              <div className={styles.characterImageSection}>
                {character.imageCharacterSelect ? (
                  <img 
                    src={character.imageCharacterSelect} 
                    alt={character.name?.ja || 'Character'} 
                    className={styles.characterImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    👤
                  </div>
                )}
                {character.themeColor && (
                  <div className={styles.themeColorSection}>
                    <div 
                      className={styles.themeColorSwatch}
                      style={{ background: character.themeColor }}
                    ></div>
                    <span className={styles.themeColorText}>
                      {character.themeColor}
                    </span>
                  </div>
                )}
              </div>

              {/* 基本情報 */}
              <div className={styles.basicInfo}>
                <h2 className={styles.characterName}>
                  {character.name?.ja || 'No Name'}
                </h2>
                {character.name?.en && (
                  <p className={styles.englishName}>
                    {character.name.en}
                  </p>
                )}
                <p className={styles.description}>
                  {character.description?.ja || 'No description'}
                </p>
                <div className={styles.metaInfo}>
                  <span className={styles.metaItem}>
                    📅 {character.createdAt ? new Date(character.createdAt).toLocaleDateString('ja-JP') : '-'}
                  </span>
                  {character.personality && (
                    <span className={styles.metaItem}>
                      🎭 {character.personality}
                    </span>
                  )}
                </div>
              </div>

              {/* 販売情報 */}
              <div className={styles.salesInfo}>
                {character.price && character.characterAccessType === 'purchaseOnly' && (
                  <div className={styles.price}>
                    ¥{character.price?.toLocaleString()}
                  </div>
                )}
                <div className={styles.purchaseType}>
                  {character.purchaseType}
                </div>
              </div>
            </div>
          </div>

          {/* 詳細情報グリッド */}
          <div className={styles.detailGrid}>
            {/* 多言語情報 */}
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <span className={styles.detailIcon}>🌍</span>
                <h3 className={styles.detailTitle}>多言語情報</h3>
              </div>
              <div className={styles.detailContent}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    日本語名
                  </div>
                  <div className={styles.fieldValue}>
                    {character.name?.ja || '-'}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    英語名
                  </div>
                  <div className={styles.fieldValue}>
                    {character.name?.en || '-'}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    日本語説明
                  </div>
                  <div className={styles.fieldTextArea}>
                    {character.description?.ja || '-'}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    英語説明
                  </div>
                  <div className={styles.fieldTextArea}>
                    {character.description?.en || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* AI設定 */}
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <span className={styles.detailIcon}>🤖</span>
                <h3 className={styles.detailTitle}>AI設定</h3>
              </div>
              <div className={styles.detailContent}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    音声設定
                  </div>
                  <div className={styles.fieldValue}>
                    🎤 {character.voice || '-'}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    デフォルトメッセージ（日本語）
                  </div>
                  <div className={styles.fieldTextArea}>
                    {character.defaultMessage?.ja || '-'}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    デフォルトメッセージ（英語）
                  </div>
                  <div className={styles.fieldTextArea}>
                    {character.defaultMessage?.en || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* プロンプト設定 */}
            <div className={`${styles.detailCard} ${styles.detailCardWide}`}>
              <div className={styles.detailHeader}>
                <span className={styles.detailIcon}>📝</span>
                <h3 className={styles.detailTitle}>プロンプト設定</h3>
              </div>
              <div className={styles.promptGrid}>
                <div className={styles.promptSection}>
                  <div className={styles.promptSectionTitle}>
                    性格プロンプト
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>
                      日本語
                    </div>
                    <div className={`${styles.fieldTextArea} ${styles.promptField}`}>
                      {character.personalityPrompt?.ja || '-'}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>
                      英語
                    </div>
                    <div className={`${styles.fieldTextArea} ${styles.promptField}`}>
                      {character.personalityPrompt?.en || '-'}
                    </div>
                  </div>
                </div>
                <div className={styles.promptSection}>
                  <div className={styles.promptSectionTitle}>
                    管理者プロンプト
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>
                      日本語
                    </div>
                    <div className={`${styles.fieldTextArea} ${styles.promptField}`}>
                      {character.adminPrompt?.ja || '-'}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>
                      英語
                    </div>
                    <div className={`${styles.fieldTextArea} ${styles.promptField}`}>
                      {character.adminPrompt?.en || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* メディア情報 */}
            <div className={`${styles.detailCard} ${styles.detailCardWide}`}>
              <div className={styles.detailHeader}>
                <span className={styles.detailIcon}>🎨</span>
                <h3 className={styles.detailTitle}>メディア情報</h3>
              </div>
              
              {/* 画像セクション */}
              <div className={styles.mediaSection}>
                <div className={styles.mediaSectionTitle}>
                  画像
                </div>
                <div className={styles.imageGrid}>
                  {[
                    { key: 'imageCharacterSelect', label: 'キャラクター選択', icon: '👤' },
                    { key: 'imageDashboard', label: 'ダッシュボード', icon: '📊' },
                    { key: 'imageChatBackground', label: 'チャット背景', icon: '🖼️' },
                    { key: 'imageChatAvatar', label: 'チャットアバター', icon: '💬' }
                  ].map(({ key, label, icon }) => (
                    <div key={key} className={styles.mediaItem}>
                      <div className={styles.mediaLabel}>
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                      {character[key] ? (
                        <img 
                          src={character[key]} 
                          alt={label} 
                          className={styles.mediaImage}
                        />
                      ) : (
                        <div className={styles.mediaPlaceholder}>
                          {icon}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 音声セクション */}
              <div className={styles.audioSection}>
                <div className={styles.mediaSectionTitle}>
                  音声
                </div>
                <div className={styles.audioLabel}>
                  <span>🎵</span>
                  <span>サンプル音声</span>
                </div>
                {character.sampleVoiceUrl ? (
                  <audio 
                    src={character.sampleVoiceUrl} 
                    controls 
                    className={styles.audioPlayer}
                  />
                ) : (
                  <div className={styles.audioPlaceholder}>
                    🎤 音声ファイルが設定されていません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 