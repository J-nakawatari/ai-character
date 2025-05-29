'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useRequireAuth from '../../utils/useRequireAuth';
import { apiGet, apiPost, apiPatch } from '../../utils/api';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';
import GlobalLoading from '../../components/GlobalLoading';
import ErrorMessage from '../../components/ErrorMessage';

export default function MyPage({ params }) {
  const { user, loading, element } = useRequireAuth();
  const router = useRouter();
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const [purchasedCharacters, setPurchasedCharacters] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState('');
  const t = useTranslations('mypage');
  const tApp = useTranslations('app');
  
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    } else if (user) {
      fetchPurchasedCharacters();
    }
  }, [loading, user, router, locale]);
  
  const fetchPurchasedCharacters = async () => {
    const res = await apiGet('/users/me/purchases');
    if (res.success) {
      setPurchasedCharacters(res.data);
    } else {
      console.error('購入済みキャラクターの取得に失敗しました', res.error);
    }
  };
  
  const handleSelectCharacter = async (characterId) => {
    try {
      const isPurchased = purchasedCharacters.some(
        item => item.character._id === characterId
      );
      if (!isPurchased) {
        alert('このキャラクターは購入が必要です。');
        return;
      }
      const res = await apiPatch('/users/me/use-character', { characterId });
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || 'キャラクターの選択に失敗しました。');
      }
    } catch (err) {
      console.error('キャラクター選択に失敗しました', err);
      alert('キャラクターの選択に失敗しました。');
    }
  };
  
  const handleLanguageChange = async (language) => {
    try {
      const { success } = await updateLanguage(language);
      if (success) {
        const newPath = window.location.pathname.replace(/^\/(ja|en)/, `/${language}`);
        router.push(newPath + window.location.search);
      }
    } catch (err) {
      console.error('言語設定の変更に失敗しました', err);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!password) {
      setError(t('password_required') || 'パスワードを入力してください');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await apiPost('/users/me/delete', { password });
      if (res.success) {
        await logout();
        router.push(`/${locale}/login`);
      } else {
        setError(res.error || t('delete_account_failed') || 'アカウント削除に失敗しました');
        setIsDeleting(false);
      }
    } catch (err) {
      setError(t('delete_account_failed') || 'アカウント削除に失敗しました');
      setIsDeleting(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };
  
  const handleUnsubscribe = async () => {
    if (!window.confirm(t('unsubscribe_confirm', '本当にサブスクを解除しますか？'))) return;
    setIsUnsubscribing(true);
    setUnsubscribeError('');
    const res = await apiPost('/users/me/unsubscribe');
    if (res.success) {
      window.location.reload();
    } else {
      setUnsubscribeError(res.error || t('unsubscribe_failed', 'サブスク解除に失敗しました'));
      setIsUnsubscribing(false);
    }
  };
  
  const handleUpgrade = async () => {
    try {
      const returnTo = window.location.href;
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, returnTo })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('決済ページの取得に失敗しました');
      }
    } catch (e) {
      alert('エラーが発生しました');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return t('not_set') || '未設定';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (element) return element;
  if (!user) return null;
  
  return (
    <div className="mypage">
      <div className="mypage__header">
        <BackButton href={`/${locale}/dashboard`} label={t('back_to_dashboard') || "ダッシュボードに戻る"} />
        <div className="mypage__header-content">
          <div className="mypage__user-avatar">
            <div className="mypage__avatar-circle">
              {user.name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
          </div>
          <div className="mypage__user-info">
            <h1 className="mypage__title">
              {t('title')} 
              <span className="mypage__welcome">
                {user.name}さん、こんにちは！
              </span>
            </h1>
            <div className="mypage__member-badge">
              <span className={`mypage__badge ${user.membershipType === 'subscription' ? 'mypage__badge--premium' : 'mypage__badge--free'}`}>
                {user.membershipType === 'subscription' ? '👑 プレミアム会員' : '🌟 フリー会員'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mypage__content">
        {/* アカウント情報 */}
        <section className="mypage__section mypage__section--account">
          <div className="mypage__section-header">
            <h2 className="mypage__section-title">
              <span className="mypage__section-icon">👤</span>
              {t('account_info')}
            </h2>
          </div>
          <div className="mypage__info-cards">
            <div className="mypage__info-card">
              <div className="mypage__info-icon">👤</div>
              <div className="mypage__info-content">
                <div className="mypage__info-label">{t('username')}</div>
                <div className="mypage__info-value">{user.name}</div>
              </div>
            </div>
            
            <div className="mypage__info-card">
              <div className="mypage__info-icon">📧</div>
              <div className="mypage__info-content">
                <div className="mypage__info-label">{t('email')}</div>
                <div className="mypage__info-value">{user.email}</div>
              </div>
            </div>
            
            <div className="mypage__info-card">
              <div className="mypage__info-icon">🎯</div>
              <div className="mypage__info-content">
                <div className="mypage__info-label">{t('member_type')}</div>
                <div className="mypage__info-value">
                  {user.membershipType === 'subscription' ? t('premium_member') : t('free_member')}
                </div>
              </div>
            </div>
            
            <div className="mypage__info-card">
              <div className="mypage__info-icon">📅</div>
              <div className="mypage__info-content">
                <div className="mypage__info-label">{t('register_date')}</div>
                <div className="mypage__info-value">{formatDate(user.createdAt)}</div>
              </div>
            </div>
            
            <div className="mypage__info-card">
              <div className="mypage__info-icon">🕒</div>
              <div className="mypage__info-content">
                <div className="mypage__info-label">{t('last_login')}</div>
                <div className="mypage__info-value">{formatDate(user.lastLoginDate)}</div>
              </div>
            </div>
          </div>
        </section>
      
        {/* サブスクリプション情報 */}
        <section className="mypage__section mypage__section--subscription">
          <div className="mypage__section-header">
            <h2 className="mypage__section-title">
              <span className="mypage__section-icon">💳</span>
              {t('subscription_info')}
            </h2>
          </div>
          
          <div className="mypage__subscription-content">
            <div className="mypage__subscription-status">
              <div className="mypage__status-card">
                <div className="mypage__status-header">
                  <span className={`mypage__status-indicator mypage__status--${user.subscriptionStatus || 'free'}`}>
                    {user.subscriptionStatus === 'active' ? '✅' : 
                     user.subscriptionStatus === 'inactive' ? '⚠️' : 
                     user.subscriptionStatus === 'expired' ? '❌' : 
                     user.subscriptionStatus === 'canceled' ? '🚫' : '🆓'}
                  </span>
                  <div className="mypage__status-text">
                    <div className="mypage__status-title">
                      {user.subscriptionStatus === 'active' ? t('status_active') : 
                       user.subscriptionStatus === 'inactive' ? t('status_inactive') : 
                       user.subscriptionStatus === 'expired' ? t('status_expired') : 
                       user.subscriptionStatus === 'canceled' ? t('status_canceled') : t('status_free')}
                    </div>
                    <div className="mypage__status-subtitle">
                      {user.membershipType === 'subscription' ? 'プレミアム会員' : 'フリー会員'}
                    </div>
                  </div>
                </div>
                
                {user.membershipType === 'subscription' && (
                  <div className="mypage__subscription-details">
                    <div className="mypage__detail-row">
                      <span className="mypage__detail-label">🚀 開始日</span>
                      <span className="mypage__detail-value">{formatDate(user.subscriptionStartDate)}</span>
                    </div>
                    <div className="mypage__detail-row">
                      <span className="mypage__detail-label">🔄 次回請求日</span>
                      <span className="mypage__detail-value">{formatDate(user.subscriptionEndDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mypage__subscription-actions">
              {user.membershipType === 'subscription' ? (
                <div className="mypage__action-section">
                  <button className="mypage__unsubscribe-button" onClick={handleUnsubscribe} disabled={isUnsubscribing}>
                    {isUnsubscribing ? '⏳ 処理中...' : '❌ サブスクを解除する'}
                  </button>
                  {unsubscribeError && <ErrorMessage message={unsubscribeError} type="toast" className="mypage-error-message" />}
                </div>
              ) : (
                <div className="mypage__upgrade-section">
                  <div className="mypage__upgrade-benefits">
                    <h4>プレミアム会員の特典</h4>
                    <ul className="mypage__benefits-list">
                      <li>🎭 すべてのプレミアムキャラクターにアクセス</li>
                      <li>💬 無制限チャット</li>
                      <li>🎨 特別な画像とボイス</li>
                      <li>⭐ 優先サポート</li>
                    </ul>
                  </div>
                  <button className="mypage__upgrade-button" onClick={handleUpgrade}>
                    <span className="mypage__upgrade-icon">👑</span>
                    {t('upgrade_button')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* 購入済みキャラクター */}
        <section className="mypage__section mypage__section--characters">
          <div className="mypage__section-header">
            <h2 className="mypage__section-title">
              <span className="mypage__section-icon">🎭</span>
              {t('purchased_characters')}
            </h2>
          </div>
          
          {purchasedCharacters.length === 0 ? (
            <div className="mypage__empty-state">
              <div className="mypage__empty-icon">🛒</div>
              <div className="mypage__empty-title">まだキャラクターを購入していません</div>
              <div className="mypage__empty-description">
                ストアでお気に入りのキャラクターを見つけて、特別な体験を始めましょう！
              </div>
            </div>
          ) : (
            <div className="mypage__character-grid">
              {purchasedCharacters.map((item) => (
                <div 
                  key={item.character?._id || `no-character-${Math.random()}`}
                  className="mypage__character-card"
                >
                  <div className="mypage__character-image-container">
                    <img 
                      src={item.character?.imageCharacterSelect || '/images/character-placeholder.png'} 
                      alt={item.character?.name?.ja || item.character?.name || 'Character'}
                      className="mypage__character-image"
                    />
                    <div className="mypage__character-badge">✅</div>
                  </div>
                  <div className="mypage__character-info">
                    <div className="mypage__character-name">
                      {item.character?.name?.ja || item.character?.name || 'キャラクター名不明'}
                    </div>
                    <div className="mypage__character-date">
                      <span className="mypage__date-icon">📅</span>
                      {formatDate(item.purchaseDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* 設定セクション */}
        <div className="mypage__settings-grid">
          {/* 言語設定 */}
          <section className="mypage__section mypage__section--settings">
            <div className="mypage__section-header">
              <h2 className="mypage__section-title">
                <span className="mypage__section-icon">🌍</span>
                {t('language_settings')}
              </h2>
            </div>
            <div className="mypage__setting-content">
              <p className="mypage__setting-description">{t('select_language')}</p>
              <div className="mypage__language-selector">
                <select
                  className="mypage__language-select"
                  value={user.preferredLanguage}
                  onChange={e => handleLanguageChange(e.target.value)}
                >
                  <option value="ja">🇯🇵 {t('language_japanese')}</option>
                  <option value="en">🇺🇸 {t('language_english')}</option>
                </select>
              </div>
            </div>
          </section>
          
          {/* アカウント削除 */}
          <section className="mypage__section mypage__section--danger">
            <div className="mypage__section-header">
              <h2 className="mypage__section-title">
                <span className="mypage__section-icon">⚠️</span>
                {t('delete_account')}
              </h2>
            </div>
            <div className="mypage__setting-content">
              <p className="mypage__danger-description">{t('delete_account_description')}</p>
              <button 
                className="mypage__danger-button"
                onClick={() => setShowDeleteModal(true)}
              >
                <span className="mypage__danger-icon">🗑️</span>
                {t('delete_account')}
              </button>
            </div>
          </section>
        </div>
      </div>
      
      {/* 退会確認モーダル */}
      {showDeleteModal && (
        <div className="mypage__modal-overlay">
          <div className="mypage__modal-content">
            <h3 className="mypage__modal-title">{t('delete_account_confirm')}</h3>
            <p className="mypage__modal-message">
              {t('delete_account_warning')}
            </p>
            
            {user.membershipType === 'subscription' && user.subscriptionStatus === 'active' && (
              <div className="mypage__modal-warning">
                {t('premium_warning')}
              </div>
            )}
            
            <div className="mypage__modal-form">
              <div className="mypage__info-label">{t('delete_account_password')}</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder={t('password')}
              />
              {error && <ErrorMessage message={error} type="inline" className="mypage-error-message" />}
            </div>
            
            <div className="mypage__modal-buttons">
              <button
                className="mypage__modal-button mypage__modal-button--cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword('');
                  setError('');
                }}
              >
                {t('cancel')}
              </button>
              <button
                className="mypage__modal-button mypage__modal-button--delete"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? t('processing') : t('delete_account_button')}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
