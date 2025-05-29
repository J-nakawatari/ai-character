'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';

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
      <div className="admin-content">
        <div className="admin-card" style={{textAlign: 'center', padding: '4rem'}}>
          <div style={{fontSize: '1.125rem', color: 'var(--admin-gray-600)'}}>読み込み中...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="admin-content">
        <div className="admin-card" style={{textAlign: 'center', padding: '4rem'}}>
          <div style={{fontSize: '1.125rem', color: 'var(--admin-error-500)'}}>
            ❌ {error}
          </div>
          <button 
            className="admin-btn admin-btn--secondary" 
            style={{marginTop: '1rem'}}
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
      free: { text: '無料', class: 'admin-badge--success' },
      subscription: { text: 'サブスク', class: 'admin-badge--warning' },
      purchaseOnly: { text: '買い切り', class: 'admin-badge--neutral' }
    };
    const badge = badges[type] || { text: type, class: 'admin-badge--neutral' };
    return <span className={`admin-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`admin-badge ${isActive ? 'admin-badge--success' : 'admin-badge--error'}`}>
        {isActive ? '✅ 有効' : '❌ 無効'}
      </span>
    );
  };

  return (
    <div className="admin-content">
      {/* ヘッダー */}
      <div style={{marginBottom: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h1 style={{fontSize: '2rem', fontWeight: '700', color: 'var(--admin-gray-900)', margin: '0 0 0.5rem 0'}}>
              キャラクター詳細
            </h1>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
              {getAccessTypeBadge(character.characterAccessType)}
              {getStatusBadge(character.isActive)}
              <span style={{color: 'var(--admin-gray-500)', fontSize: '0.875rem'}}>
                ID: {params.id}
              </span>
            </div>
          </div>
          <div style={{display: 'flex', gap: '0.75rem'}}>
            <button 
              className="admin-btn admin-btn--primary"
              onClick={() => router.push(`/admin/characters/${params.id}`)}
            >
              ✏️ 編集
            </button>
            <button 
              className="admin-btn admin-btn--secondary"
              onClick={() => router.push('/admin/characters')}
            >
              ← 一覧に戻る
            </button>
          </div>
        </div>
      </div>
      {/* メインコンテンツ */}
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        {/* キャラクター概要カード */}
        <div className="admin-card admin-card--elevated" style={{marginBottom: '2rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', alignItems: 'start'}}>
            {/* キャラクター画像 */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
              {character.imageCharacterSelect ? (
                <img 
                  src={character.imageCharacterSelect} 
                  alt={character.name?.ja || 'Character'} 
                  style={{
                    width: '160px', 
                    height: '160px', 
                    borderRadius: 'var(--admin-radius-2xl)', 
                    objectFit: 'cover',
                    border: '4px solid var(--admin-primary-100)'
                  }} 
                />
              ) : (
                <div style={{
                  width: '160px', 
                  height: '160px', 
                  borderRadius: 'var(--admin-radius-2xl)', 
                  background: 'var(--admin-gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--admin-gray-500)',
                  fontSize: '2rem'
                }}>
                  👤
                </div>
              )}
              {character.themeColor && (
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: character.themeColor,
                    border: '2px solid var(--admin-gray-200)'
                  }}></div>
                  <span style={{fontSize: '0.875rem', color: 'var(--admin-gray-600)'}}>
                    {character.themeColor}
                  </span>
                </div>
              )}
            </div>

            {/* 基本情報 */}
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--admin-gray-900)', margin: '0 0 1rem 0'}}>
                {character.name?.ja || 'No Name'}
              </h2>
              {character.name?.en && (
                <p style={{fontSize: '1.125rem', color: 'var(--admin-gray-600)', margin: '0 0 1rem 0'}}>
                  {character.name.en}
                </p>
              )}
              <p style={{color: 'var(--admin-gray-700)', lineHeight: '1.6', margin: '0 0 1.5rem 0'}}>
                {character.description?.ja || 'No description'}
              </p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                <span style={{fontSize: '0.875rem', color: 'var(--admin-gray-500)'}}>
                  📅 {character.createdAt ? new Date(character.createdAt).toLocaleDateString('ja-JP') : '-'}
                </span>
                {character.personality && (
                  <span style={{fontSize: '0.875rem', color: 'var(--admin-gray-500)'}}>
                    🎭 {character.personality}
                  </span>
                )}
              </div>
            </div>

            {/* 販売情報 */}
            <div style={{textAlign: 'right'}}>
              {character.price && character.characterAccessType === 'purchaseOnly' && (
                <div style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--admin-gray-900)', marginBottom: '0.5rem'}}>
                  ¥{character.price?.toLocaleString()}
                </div>
              )}
              <div style={{fontSize: '0.875rem', color: 'var(--admin-gray-600)'}}>
                {character.purchaseType}
              </div>
            </div>
          </div>
        </div>

        {/* 詳細情報グリッド */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem'}}>
          {/* 多言語情報 */}
          <div className="admin-card">
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--admin-gray-900)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              🌍 多言語情報
            </h3>
            <div style={{display: 'grid', gap: '1.5rem'}}>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  日本語名
                </div>
                <div style={{fontSize: '1rem', color: 'var(--admin-gray-900)'}}>
                  {character.name?.ja || '-'}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  英語名
                </div>
                <div style={{fontSize: '1rem', color: 'var(--admin-gray-900)'}}>
                  {character.name?.en || '-'}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  日本語説明
                </div>
                <div style={{
                  fontSize: '0.875rem', 
                  color: 'var(--admin-gray-700)', 
                  lineHeight: '1.5',
                  background: 'var(--admin-gray-50)',
                  padding: '0.75rem',
                  borderRadius: 'var(--admin-radius-lg)',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {character.description?.ja || '-'}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  英語説明
                </div>
                <div style={{
                  fontSize: '0.875rem', 
                  color: 'var(--admin-gray-700)', 
                  lineHeight: '1.5',
                  background: 'var(--admin-gray-50)',
                  padding: '0.75rem',
                  borderRadius: 'var(--admin-radius-lg)',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {character.description?.en || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* AI設定 */}
          <div className="admin-card">
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--admin-gray-900)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              🤖 AI設定
            </h3>
            <div style={{display: 'grid', gap: '1.5rem'}}>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  音声設定
                </div>
                <div style={{fontSize: '1rem', color: 'var(--admin-gray-900)'}}>
                  🎤 {character.voice || '-'}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  デフォルトメッセージ（日本語）
                </div>
                <div style={{
                  fontSize: '0.875rem', 
                  color: 'var(--admin-gray-700)', 
                  lineHeight: '1.5',
                  background: 'var(--admin-gray-50)',
                  padding: '0.75rem',
                  borderRadius: 'var(--admin-radius-lg)',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {character.defaultMessage?.ja || '-'}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  デフォルトメッセージ（英語）
                </div>
                <div style={{
                  fontSize: '0.875rem', 
                  color: 'var(--admin-gray-700)', 
                  lineHeight: '1.5',
                  background: 'var(--admin-gray-50)',
                  padding: '0.75rem',
                  borderRadius: 'var(--admin-radius-lg)',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {character.defaultMessage?.en || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* プロンプト設定 */}
          <div className="admin-card" style={{gridColumn: 'span 2'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--admin-gray-900)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              📝 プロンプト設定
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem'}}>
              <div>
                <div style={{fontSize: '1rem', fontWeight: '500', color: 'var(--admin-gray-700)', marginBottom: '1rem'}}>
                  性格プロンプト
                </div>
                <div style={{display: 'grid', gap: '1rem'}}>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                      日本語
                    </div>
                    <div style={{
                      fontSize: '0.875rem', 
                      color: 'var(--admin-gray-700)', 
                      lineHeight: '1.5',
                      background: 'var(--admin-gray-50)',
                      padding: '1rem',
                      borderRadius: 'var(--admin-radius-lg)',
                      maxHeight: '200px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {character.personalityPrompt?.ja || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                      英語
                    </div>
                    <div style={{
                      fontSize: '0.875rem', 
                      color: 'var(--admin-gray-700)', 
                      lineHeight: '1.5',
                      background: 'var(--admin-gray-50)',
                      padding: '1rem',
                      borderRadius: 'var(--admin-radius-lg)',
                      maxHeight: '200px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {character.personalityPrompt?.en || '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{fontSize: '1rem', fontWeight: '500', color: 'var(--admin-gray-700)', marginBottom: '1rem'}}>
                  管理者プロンプト
                </div>
                <div style={{display: 'grid', gap: '1rem'}}>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                      日本語
                    </div>
                    <div style={{
                      fontSize: '0.875rem', 
                      color: 'var(--admin-gray-700)', 
                      lineHeight: '1.5',
                      background: 'var(--admin-gray-50)',
                      padding: '1rem',
                      borderRadius: 'var(--admin-radius-lg)',
                      maxHeight: '200px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {character.adminPrompt?.ja || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                      英語
                    </div>
                    <div style={{
                      fontSize: '0.875rem', 
                      color: 'var(--admin-gray-700)', 
                      lineHeight: '1.5',
                      background: 'var(--admin-gray-50)',
                      padding: '1rem',
                      borderRadius: 'var(--admin-radius-lg)',
                      maxHeight: '200px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {character.adminPrompt?.en || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* メディア情報 */}
          <div className="admin-card" style={{gridColumn: 'span 2'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--admin-gray-900)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              🎨 メディア情報
            </h3>
            
            {/* 画像セクション */}
            <div style={{marginBottom: '2rem'}}>
              <div style={{fontSize: '1rem', fontWeight: '500', color: 'var(--admin-gray-700)', marginBottom: '1rem'}}>
                画像
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem'}}>
                {[
                  { key: 'imageCharacterSelect', label: 'キャラクター選択', icon: '👤' },
                  { key: 'imageDashboard', label: 'ダッシュボード', icon: '📊' },
                  { key: 'imageChatBackground', label: 'チャット背景', icon: '🖼️' },
                  { key: 'imageChatAvatar', label: 'チャットアバター', icon: '💬' }
                ].map(({ key, label, icon }) => (
                  <div key={key} style={{textAlign: 'center'}}>
                    <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                      {icon} {label}
                    </div>
                    {character[key] ? (
                      <img 
                        src={character[key]} 
                        alt={label} 
                        style={{
                          width: '100%', 
                          maxWidth: '150px',
                          height: '150px', 
                          borderRadius: 'var(--admin-radius-lg)', 
                          objectFit: 'cover',
                          border: '2px solid var(--admin-gray-200)'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        maxWidth: '150px',
                        height: '150px',
                        margin: '0 auto',
                        borderRadius: 'var(--admin-radius-lg)',
                        background: 'var(--admin-gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--admin-gray-500)',
                        fontSize: '2rem',
                        border: '2px dashed var(--admin-gray-300)'
                      }}>
                        {icon}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 音声セクション */}
            <div>
              <div style={{fontSize: '1rem', fontWeight: '500', color: 'var(--admin-gray-700)', marginBottom: '1rem'}}>
                音声
              </div>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'var(--admin-gray-600)', marginBottom: '0.5rem'}}>
                  🎵 サンプル音声
                </div>
                {character.sampleVoiceUrl ? (
                  <audio 
                    src={character.sampleVoiceUrl} 
                    controls 
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '40px'
                    }} 
                  />
                ) : (
                  <div style={{
                    padding: '1rem',
                    background: 'var(--admin-gray-100)',
                    borderRadius: 'var(--admin-radius-lg)',
                    color: 'var(--admin-gray-500)',
                    textAlign: 'center',
                    border: '2px dashed var(--admin-gray-300)'
                  }}>
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