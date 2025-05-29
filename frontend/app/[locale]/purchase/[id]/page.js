'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../../../utils/useRequireAuth';
import { apiGet, apiPost } from '../../../utils/api';
import { useTranslations } from 'next-intl';
import BackButton from '../../../components/BackButton';
import '../../../styles/pages/purchase.css';

export default function PurchasePage({ params }) {
  const { user, loading, element } = useRequireAuth();
  const router = useRouter();
  const resolvedParams = typeof params.then === 'function' ? use(params) : params;
  const { locale, id: characterId } = resolvedParams;
  const [character, setCharacter] = useState(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('purchase');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
      return;
    }

    const fetchCharacter = async () => {
      try {
        const res = await apiGet(`/characters/${characterId}`);
        if (res.success) {
          setCharacter(res.data);
        } else {
          setError('キャラクター情報の取得に失敗しました');
        }
      } catch (err) {
        setError('キャラクター情報の取得に失敗しました');
      } finally {
        setLoadingCharacter(false);
      }
    };

    if (user && characterId) {
      fetchCharacter();
    }
  }, [loading, user, router, locale, characterId]);

  const handlePurchase = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // ここで実際の購入APIを呼び出し
      const res = await apiPost(`/characters/${characterId}/purchase`);
      if (res.success) {
        router.push(`/${locale}/dashboard?purchased=true`);
      } else {
        setError(res.error || '購入に失敗しました');
      }
    } catch (err) {
      setError('購入に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  if (element) return element;
  if (!user) return null;

  if (loading || loadingCharacter) {
    return (
      <div className="purchase-root">
        <div className="purchase-loading">
          <div className="purchase-loading-spinner"></div>
          <div>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error && !character) {
    return (
      <div className="purchase-root">
        <div className="purchase-error">
          <div className="purchase-error-icon">❌</div>
          <div className="purchase-error-title">エラーが発生しました</div>
          <div className="purchase-error-message">{error}</div>
          <button 
            className="purchase-back-button"
            onClick={() => router.push(`/${locale}/setup`)}
          >
            キャラクター選択に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!character) return null;

  const characterName = character.name && typeof character.name === 'object' 
    ? (character.name[locale] || character.name.ja || character.name) 
    : character.name;

  const characterDesc = character.description && typeof character.description === 'object'
    ? (character.description[locale] || character.description.ja || character.description)
    : character.description;

  // 既に購入済みかチェック
  const isPurchased = user.purchasedCharacters?.some(
    pc => pc.character?._id === characterId && pc.purchaseType === 'buy'
  );

  if (isPurchased) {
    return (
      <div className="purchase-root">
        <div className="purchase-already-owned">
          <div className="purchase-success-icon">✅</div>
          <div className="purchase-success-title">既に購入済みです</div>
          <div className="purchase-success-message">
            このキャラクターは既に購入済みです。ダッシュボードから利用できます。
          </div>
          <button 
            className="purchase-primary-button"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            ダッシュボードに移動
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-root">
      <div className="purchase-header">
        <BackButton 
          href={`/${locale}/setup`} 
          label="キャラクター選択に戻る" 
        />
      </div>

      <div className="purchase-container">
        <div className="purchase-content">
          {/* キャラクター情報カード */}
          <div className="purchase-character-card">
            <div className="purchase-character-header">
              <h1 className="purchase-title">
                <span className="purchase-title-icon">🛒</span>
                キャラクター購入
              </h1>
            </div>

            <div className="purchase-character-content">
              <div className="purchase-character-image-section">
                <div className="purchase-character-image-container">
                  <img
                    src={character.imageCharacterSelect || '/images/default.png'}
                    alt={characterName}
                    className="purchase-character-image"
                  />
                  <div className="purchase-character-badge">
                    <span className="purchase-badge purchase-badge--premium">
                      💎 プレミアム
                    </span>
                  </div>
                </div>
              </div>

              <div className="purchase-character-info">
                <h2 className="purchase-character-name">{characterName}</h2>
                <p className="purchase-character-description">{characterDesc}</p>
                
                {/* 性格タグ */}
                {character.personality && (
                  <div className="purchase-character-tags">
                    {character.personality.split(/,| /).slice(0, 4).map((tag, idx) =>
                      tag.trim() && (
                        <span className="purchase-character-tag" key={idx}>
                          {tag.trim()}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* 特典リスト */}
                <div className="purchase-features">
                  <h3 className="purchase-features-title">購入特典</h3>
                  <ul className="purchase-features-list">
                    <li>🎭 このキャラクターとの無制限チャット</li>
                    <li>🎨 専用画像・ボイスへのアクセス</li>
                    <li>💝 特別なストーリー体験</li>
                    <li>⭐ 永続的な利用権限</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 購入カード */}
          <div className="purchase-payment-card">
            <div className="purchase-payment-header">
              <h3 className="purchase-payment-title">購入内容</h3>
            </div>

            <div className="purchase-payment-content">
              <div className="purchase-price-breakdown">
                <div className="purchase-price-item">
                  <span className="purchase-price-label">{characterName}</span>
                  <span className="purchase-price-value">¥{character.price?.toLocaleString()}</span>
                </div>
                <div className="purchase-price-item">
                  <span className="purchase-price-label">税込</span>
                  <span className="purchase-price-value">¥0</span>
                </div>
                <div className="purchase-price-divider"></div>
                <div className="purchase-price-item purchase-price-total">
                  <span className="purchase-price-label">合計</span>
                  <span className="purchase-price-value">¥{character.price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="purchase-payment-note">
                <div className="purchase-note-icon">ℹ️</div>
                <div className="purchase-note-text">
                  一度購入すると永続的に利用できます。<br />
                  返金はできませんのでご注意ください。
                </div>
              </div>

              {error && (
                <div className="purchase-error-message">
                  <div className="purchase-error-icon">⚠️</div>
                  {error}
                </div>
              )}

              <div className="purchase-payment-actions">
                <button
                  className="purchase-cancel-button"
                  onClick={() => router.push(`/${locale}/setup`)}
                  disabled={processing}
                >
                  キャンセル
                </button>
                <button
                  className="purchase-primary-button"
                  onClick={handlePurchase}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="purchase-button-spinner"></div>
                      処理中...
                    </>
                  ) : (
                    <>
                      <span className="purchase-button-icon">💳</span>
                      ¥{character.price?.toLocaleString()} で購入
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 