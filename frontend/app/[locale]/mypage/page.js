'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';
import GlobalLoading from '../../components/GlobalLoading';

export default function MyPage({ params }) {
  const { user, loading, logout, updateLanguage } = useAuth();
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
    try {
      const res = await api.get('/users/me/purchases');
      setPurchasedCharacters(res.data);
    } catch (err) {
      console.error('購入済みキャラクターの取得に失敗しました', err);
    }
  };
  
  const handleSelectCharacter = async (characterId) => {
    try {
      // 購入済みキャラクターかどうかをチェック
      const isPurchased = purchasedCharacters.some(
        item => item.character._id === characterId
      );

      if (!isPurchased) {
        // 未購入の場合はエラーメッセージを表示
        alert('このキャラクターは購入が必要です。');
        return;
      }

      await api.patch('/users/me/use-character', { characterId });
      window.location.reload();
    } catch (err) {
      console.error('キャラクター選択に失敗しました', err);
      if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        alert('キャラクターの選択に失敗しました。');
      }
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
      await api.post('/users/me/delete', { password });
      await logout();
      router.push(`/${locale}/login`);
    } catch (err) {
      console.error(t('delete_account_failed') || 'アカウント削除に失敗しました', err);
      setError(err.response?.data?.msg || t('delete_account_failed') || 'アカウント削除に失敗しました');
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
    try {
      await api.post('/users/me/unsubscribe');
      window.location.reload();
    } catch (err) {
      setUnsubscribeError(err.response?.data?.msg || t('unsubscribe_failed', 'サブスク解除に失敗しました'));
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
  
  if (loading || !user) {
    return <GlobalLoading text={tApp('loading') || "読み込み中..."} />;
  }
  
  return (
    <main className="app-main">
      <div className="mypage">
        <BackButton href={`/${locale}/dashboard`} label={t('back_to_dashboard') || "ダッシュボードに戻る"} />
        
        <h1 className="mypage__title">{t('title')}</h1>
        
        {/* アカウント情報 */}
        <section className="mypage__section">
          <h2 className="mypage__section-title">{t('account_info')}</h2>
          <div className="mypage__info-grid">
            <div className="mypage__info-item">
              <div className="mypage__info-label">{t('username')}</div>
              <div className="mypage__info-value">{user.name}</div>
            </div>
            
            <div className="mypage__info-item">
              <div className="mypage__info-label">{t('email')}</div>
              <div className="mypage__info-value">{user.email}</div>
            </div>
            
            <div className="mypage__info-item">
              <div className="mypage__info-label">{t('member_type')}</div>
              <div className="mypage__info-value">
                {user.membershipType === 'subscription' ? t('premium_member') : t('free_member')}
              </div>
            </div>
            
            <div className="mypage__info-item">
              <div className="mypage__info-label">{t('register_date')}</div>
              <div className="mypage__info-value">{formatDate(user.createdAt)}</div>
            </div>
            
            <div className="mypage__info-item">
              <div className="mypage__info-label">{t('last_login')}</div>
              <div className="mypage__info-value">{formatDate(user.lastLoginDate)}</div>
            </div>
          </div>
        </section>
        
        {/* サブスクリプション情報 */}
        <section className="mypage__section">
          <h2 className="mypage__section-title">{t('subscription_info')}</h2>
          <div className="mypage__info-grid">
            <div className="mypage__info-item">
              <div className="mypage__info-label">{t('status')}</div>
              <div className="mypage__info-value mypage__status-row">
                <span className={`mypage__status mypage__status--${user.subscriptionStatus || 'active'}`}>
                  {user.subscriptionStatus === 'active' ? t('status_active') : 
                   user.subscriptionStatus === 'inactive' ? t('status_inactive') : 
                   user.subscriptionStatus === 'expired' ? t('status_expired') : 
                   user.subscriptionStatus === 'canceled' ? t('status_canceled') : t('status_free')}
                </span>
              </div>
            </div>
            
            {user.membershipType === 'subscription' && (
              <>
                <div className="mypage__info-item">
                  <div className="mypage__info-label">{t('subscription_start')}</div>
                  <div className="mypage__info-value">{formatDate(user.subscriptionStartDate)}</div>
                </div>
                <div className="mypage__info-item">
                  <div className="mypage__info-label">{t('next_billing')}</div>
                  <div className="mypage__info-value">{formatDate(user.subscriptionEndDate)}</div>
                </div>
                <div className="mypage__info-item" style={{gridColumn: '1 / -1'}}>
                  <button className="mypage__delete-button" onClick={handleUnsubscribe} disabled={isUnsubscribing}>
                    {isUnsubscribing ? t('processing', '処理中...') : t('unsubscribe_button', 'サブスクを解除する')}
                  </button>
                  {unsubscribeError && <div className="error-message">{unsubscribeError}</div>}
                </div>
              </>
            )}
          </div>
          
          {user.membershipType !== 'subscription' && (
            <button className="mypage__upgrade-button" onClick={handleUpgrade}>
              {t('upgrade_button')}
            </button>
          )}
        </section>
        
        {/* 購入済みキャラクター */}
        <section className="mypage__section">
          <h2 className="mypage__section-title">{t('purchased_characters')}</h2>
          
          {purchasedCharacters.length === 0 ? (
            <p>{t('no_purchased_characters')}</p>
          ) : (
            <div className="mypage__character-list">
              {purchasedCharacters.map((item) => (
                <div 
                  key={item.character?._id || `no-character-${Math.random()}`}
                  className={`mypage__character-item ${
                    user.selectedCharacter?._id && item.character?._id &&
                    user.selectedCharacter._id === item.character._id
                      ? 'mypage__character-item--selected'
                      : ''
                  }`}
                  onClick={() => handleSelectCharacter(item.character?._id)}
                >
                  <img 
                    src={item.character?.imageCharacterSelect || '/images/character-placeholder.png'} 
                    alt={item.character?.name?.ja || item.character?.name || 'Character'}
                    className="mypage__character-image"
                  />
                  <div className="mypage__character-name">
                    {item.character?.name?.ja || item.character?.name || 'キャラクター名不明'}
                  </div>
                  <div className="mypage__character-type">
                    {item.purchaseType === 'buy' ? t('purchase_type_buy') : t('purchase_type_subscription')}
                  </div>
                  <div className="mypage__character-date">
                    {t('purchase_date')} {formatDate(item.purchaseDate)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* 言語設定 */}
        <section className="mypage__section">
          <h2 className="mypage__section-title">{t('language_settings')}</h2>
          <p>{t('select_language')}</p>
          <div className="mypage__language-selection">
            <select
              className="mypage__language-select"
              value={user.preferredLanguage}
              onChange={e => handleLanguageChange(e.target.value)}
            >
              <option value="ja">🇯🇵 {t('language_japanese')}</option>
              <option value="en">🇺🇸 {t('language_english')}</option>
            </select>
          </div>
        </section>
        
        {/* 退会 */}
        <section className="mypage__section">
          <h2 className="mypage__section-title">{t('delete_account')}</h2>
          <p>{t('delete_account_description')}</p>
          <button 
            className="mypage__delete-button"
            onClick={() => setShowDeleteModal(true)}
          >
            {t('delete_account')}
          </button>
        </section>
        
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
                {error && <p className="error-message">{error}</p>}
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
    </main>
  );
}
