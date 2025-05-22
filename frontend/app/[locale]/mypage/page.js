'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../utils/auth';
import api from '../../../utils/api';
import BackButton from '../../../components/BackButton';
import { useTranslations } from 'next-intl';
import i18n from 'i18next';

export default function MyPage() {
  const { user, loading, logout, updateLanguage } = useAuth();
  const router = useRouter();
  const [purchasedCharacters, setPurchasedCharacters] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations('mypage');
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchPurchasedCharacters();
    }
  }, [loading, user, router]);
  
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
      await api.patch('/users/me/use-character', { characterId });
      window.location.reload();
    } catch (err) {
      console.error('キャラクター選択に失敗しました', err);
    }
  };
  
  const handleLanguageChange = async (language) => {
    try {
      const { success } = await updateLanguage(language);
      if (success) {
        i18n.changeLanguage(language);
      }
    } catch (err) {
      console.error('言語設定の変更に失敗しました', err);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await api.post('/users/me/delete', { password });
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('アカウント削除に失敗しました', err);
      setError(err.response?.data?.msg || 'アカウント削除に失敗しました');
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading || !user) {
    return (
      <div className="mypage">
        <div className="mypage__loading">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mypage">
      <BackButton href="/dashboard" label="ダッシュボードに戻る" />
      
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
              {user.membershipType === 'premium' ? t('premium_member') : t('free_member')}
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
            <div className="mypage__info-value">
              <span className={`mypage__status mypage__status--${user.subscriptionStatus || 'active'}`}>
                {user.subscriptionStatus === 'active' ? '有効' : 
                 user.subscriptionStatus === 'inactive' ? '停止中' : 
                 user.subscriptionStatus === 'expired' ? '期限切れ' : 
                 user.subscriptionStatus === 'canceled' ? 'キャンセル済み' : '無料会員'}
              </span>
            </div>
          </div>
          
          {user.membershipType === 'premium' && (
            <>
              <div className="mypage__info-item">
                <div className="mypage__info-label">{t('next_billing')}</div>
                <div className="mypage__info-value">
                  {formatDate(user.subscriptionEndDate)}
                </div>
              </div>
            </>
          )}
        </div>
        
        {user.membershipType !== 'premium' && (
          <button className="mypage__upgrade-button">
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
                key={item.character._id}
                className={`mypage__character-item ${
                  user.selectedCharacter && user.selectedCharacter._id === item.character._id 
                    ? 'mypage__character-item--selected' 
                    : ''
                }`}
                onClick={() => handleSelectCharacter(item.character._id)}
              >
                <img 
                  src={item.character.imageCharacterSelect || '/images/character-placeholder.png'} 
                  alt={item.character.name}
                  className="mypage__character-image"
                />
                <div className="mypage__character-name">
                  {item.character.name.ja || item.character.name}
                </div>
                <div className="mypage__character-type">
                  {item.purchaseType === 'buy' ? '買い切り' : 'サブスク限定'}
                </div>
                <div className="mypage__character-date">
                  購入日: {formatDate(item.purchaseDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* 言語設定 */}
      <section className="mypage__section">
        <h2 className="mypage__section-title">{t('language_settings')}</h2>
        <p>表示言語を選択してください。キャラクターとの会話も選択した言語で行われます。</p>
        
        <div className="mypage__language-selection">
          <div 
            className={`mypage__language-option ${user.preferredLanguage === 'ja' ? 'mypage__language-option--active' : ''}`}
            onClick={() => handleLanguageChange('ja')}
          >
            <span className="mypage__language-flag">🇯🇵</span>
            <span className="mypage__language-name">{t('language_japanese')}</span>
          </div>
          
          <div 
            className={`mypage__language-option ${user.preferredLanguage === 'en' ? 'mypage__language-option--active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            <span className="mypage__language-flag">🇺🇸</span>
            <span className="mypage__language-name">{t('language_english')}</span>
          </div>
        </div>
      </section>
      
      {/* 退会 */}
      <section className="mypage__section">
        <h2 className="mypage__section-title">退会</h2>
        <p>アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。</p>
        <button 
          className="mypage__delete-button"
          onClick={() => setShowDeleteModal(true)}
        >
          退会する
        </button>
      </section>
      
      {/* 退会確認モーダル */}
      {showDeleteModal && (
        <div className="mypage__modal-overlay">
          <div className="mypage__modal-content">
            <h3 className="mypage__modal-title">本当に退会しますか？</h3>
            <p className="mypage__modal-message">
              退会すると、アカウント情報、購入済みキャラクター、チャット履歴などすべてのデータが完全に削除され、復元できなくなります。
            </p>
            
            {user.membershipType === 'premium' && user.subscriptionStatus === 'active' && (
              <div className="mypage__modal-warning">
                現在プレミアムサブスクリプションに加入中です。退会しても日割り返金はありません。
              </div>
            )}
            
            <div className="mypage__modal-form">
              <div className="mypage__info-label">確認のためパスワードを入力してください</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="パスワード"
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
                キャンセル
              </button>
              <button
                className="mypage__modal-button mypage__modal-button--delete"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? '処理中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
