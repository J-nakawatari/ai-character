'use client';

import { useEffect, use, useState, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Image from 'next/image';
import useRequireAuth from '../../utils/useRequireAuth';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';
import Card from '../../components/Card';
import styles from './dashboard.module.css';
import GlobalLoading from '../../components/GlobalLoading';
import { useAuth } from '../../utils/auth';

import ImageSlider from '../../components/ImageSlider';
import ImageModal from '../../components/ImageModal';
import AffinityBar from '../../components/AffinityBar';


export default function Dashboard({ params }) {
  const { user, loading, element } = useRequireAuth();
  const auth = useAuth();
  const { logout } = auth || {};
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useParams();
  const locale = urlParams.locale || 'ja';
  const t = useTranslations('dashboard');
  const tMenu = useTranslations('menu');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [affinityData, setAffinityData] = useState(null);
  const [personalityTags, setPersonalityTags] = useState([]);
  const [chatLimitInfo, setChatLimitInfo] = useState(null);
  
  // 性格タグ表示関数（新しいpersonalityTagsフィールド対応）
  const generatePersonalityTags = useCallback(() => {
    const character = user?.selectedCharacter;
    if (!character) {
      setPersonalityTags([]);
      return;
    }

    const tags = [];
    
    // 性格プリセットを追加
    if (character.personalityPreset) {
      tags.push({
        name: character.personalityPreset,
        color: '#8b5cf6', // 紫色
        isPreset: true
      });
    }
    
    // 性格タグを追加
    if (character.personalityTags && Array.isArray(character.personalityTags)) {
      character.personalityTags.forEach(tag => {
        tags.push({
          name: tag,
          color: '#10b981', // 緑色
          isPreset: false
        });
      });
    }
    
    // 旧形式のpersonalityPromptからの生成（フォールバック）
    if (tags.length === 0 && character.personalityPrompt) {
      let text = character.personalityPrompt;
      if (typeof text === 'object') {
        text = text[locale] || text.ja || text.en || '';
      }
      if (text && text.trim()) {
        tags.push({
          name: 'カスタム性格',
          color: '#6b7280', // グレー
          isPreset: false
        });
      }
    }
    
    setPersonalityTags(tags);
  }, [user?.selectedCharacter, locale]);
  
  // 親密度情報と性格タグを取得
  useEffect(() => {
    const fetchAffinity = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const response = await fetch(`/api/users/me/affinity/${user.selectedCharacter._id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          if (response.ok) {
            const data = await response.json();
            setAffinityData(data);
          }
        } catch (err) {
          console.error('Failed to fetch affinity:', err);
        }
      }
    };

    const fetchChatLimitInfo = async () => {
      if (user?.selectedCharacter?._id && user?.membershipType === 'free') {
        try {
          const response = await fetch(`/api/chat?characterId=${user.selectedCharacter._id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          if (response.ok) {
            const data = await response.json();
            setChatLimitInfo({
              isLimitReached: data.isLimitReached,
              remainingChats: data.remainingChats
            });
          }
        } catch (err) {
          console.error('Failed to fetch chat limit info:', err);
        }
      }
    };
    
    // 性格タグの生成（新しいフィールドベース）
    generatePersonalityTags();
    
    if (!loading && user) {
      fetchAffinity();
      fetchChatLimitInfo();
    }
  }, [loading, user, locale, generatePersonalityTags]);
  
  // 定期的にチャット制限状態をチェック（無料会員のみ）
  useEffect(() => {
    if (user?.membershipType !== 'free') return;
    
    const fetchLimitInfo = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const response = await fetch(`/api/chat?characterId=${user.selectedCharacter._id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          if (response.ok) {
            const data = await response.json();
            setChatLimitInfo({
              isLimitReached: data.isLimitReached,
              remainingChats: data.remainingChats
            });
          }
        } catch (err) {
          console.error('Failed to refresh chat limit info:', err);
        }
      }
    };
    
    // 初回は短いインターバルで頻繁にチェック（管理者のリセット操作を早期検出）
    const shortInterval = setInterval(fetchLimitInfo, 5000); // 5秒ごと
    
    // 60秒後に長いインターバルに切り替え
    const longIntervalTimeout = setTimeout(() => {
      clearInterval(shortInterval);
      const longInterval = setInterval(fetchLimitInfo, 30000); // 30秒ごと
      
      return () => clearInterval(longInterval);
    }, 60000);
    
    return () => {
      clearInterval(shortInterval);
      clearTimeout(longIntervalTimeout);
    };
  }, [user?.membershipType, user?.selectedCharacter?._id]);
  
  // ウィンドウフォーカス時にチャット制限状態を再チェック
  useEffect(() => {
    if (user?.membershipType !== 'free') return;
    
    const handleFocus = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const response = await fetch(`/api/chat?characterId=${user.selectedCharacter._id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          if (response.ok) {
            const data = await response.json();
            setChatLimitInfo({
              isLimitReached: data.isLimitReached,
              remainingChats: data.remainingChats
            });
          }
        } catch (err) {
          console.error('Failed to refresh chat limit info on focus:', err);
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.membershipType, user?.selectedCharacter?._id]);
  
  const handleStartChat = async () => {
    try {
      // キャラクターの購入状態をチェック
      const character = user.selectedCharacter;
      if (character.characterAccessType === 'purchaseOnly') {
        const isPurchased = user.purchasedCharacters.some(
          pc => pc.character._id === character._id && pc.purchaseType === 'buy'
        );
        
        if (!isPurchased) {
          // 未購入の場合は購入モーダルを表示
          router.push(`/${locale}/setup?reselect=true`);
          return;
        }
      } else if (character.characterAccessType === 'subscription') {
        if (user.membershipType !== 'subscription' || user.subscriptionStatus !== 'active') {
          // サブスク会員でない場合はアップグレードモーダルを表示
          router.push(`/${locale}/setup?reselect=true`);
          return;
        }
      }
      
      // 購入済みまたは無料キャラクターの場合はチャット画面に遷移
      router.push(`/${locale}/chat`);
    } catch (err) {
      console.error('キャラクターの確認に失敗しました', err);
    }
  };
  
  const handleChangeCharacter = () => {
    router.push(`/${locale}/setup?reselect=true`);
  };
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push(`/${locale}/login`);
    }
  };
  
  if (element) return element;
  if (!user) return null;

  if (!user.selectedCharacter) {
    return (
      <div className={styles.dashboardRoot}>
        <Card className={styles.dashboardCard}>
          <p className={styles.dashboardNoCharacter}>{t('no_character_selected', '選択中のキャラクターがありません')}</p>
          <div className={styles.dashboardButtonWrapper}>
            <button
              type="button"
              onClick={handleChangeCharacter}
              className="button button--primary button--lg"
            >
              {tMenu('setup', 'キャラ設定')}
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  // キャラクターの購入状態をチェックする関数
  const isCharacterPurchased = (character) => {
    if (!character || !user.purchasedCharacters) return false;
    return user.purchasedCharacters.some(
      pc =>
        ((pc.character && (pc.character._id?.toString?.() || pc.character?.toString?.())) === character._id?.toString()) &&
        pc.purchaseType === 'buy'
    );
  };

  // ボタンの表示テキストとタイプを取得する関数
  const getButtonProps = (character) => {
    if (character.characterAccessType === 'purchaseOnly' && !isCharacterPurchased(character)) {
      return {
        text: t('purchase_character', '購入する'),
        type: 'purchase'
      };
    } else if (character.characterAccessType === 'subscription' && 
               (user.membershipType !== 'subscription' || user.subscriptionStatus !== 'active')) {
      return {
        text: t('upgrade_to_premium', 'サブスクにアップグレード'),
        type: 'upgrade'
      };
    }
    return {
      text: t('start_chat', 'チャットを始める'),
      type: 'chat'
    };
  };

  const buttonProps = getButtonProps(user.selectedCharacter);

  const handleImageClick = (index) => {
    setModalInitialIndex(index);
    setModalOpen(true);
  };

  // キャラクターのギャラリー画像を取得（親密度によるロック情報付き）
  const getSliderImages = () => {
    if (!user?.selectedCharacter) return [];
    
    const galleryImages = [];
    
    // ギャラリー画像1-10をチェック
    for (let i = 1; i <= 10; i++) {
      const imageUrl = user.selectedCharacter[`galleryImage${i}`];
      if (imageUrl) {
        const isPremium = i >= 9; // スロット9,10がプレミア枠
        const slotLabel = isPremium ? `プレミア枠${i - 8}` : `ギャラリー画像 ${i}`;
        galleryImages.push({
          src: imageUrl,
          alt: `${user.selectedCharacter.name} - ${slotLabel}`,
          unlockLevel: (i - 1) * 10, // レベル0, 10, 20, 30...で解放
          isPremium: isPremium
        });
      }
    }
    
    // ギャラリー画像がある場合はそれを使用
    if (galleryImages.length > 0) {
      return galleryImages;
    }
    
    // 新しいgalleryImagesスキーマがある場合
    if (user.selectedCharacter.galleryImages?.length > 0) {
      return user.selectedCharacter.galleryImages.map(img => ({
        src: img.url,
        alt: img.title?.ja || img.title?.en || user.selectedCharacter.name,
        unlockLevel: img.unlockLevel || 0
      }));
    }
    
    // 従来のimagesフィールドがある場合
    if (user.selectedCharacter.images?.length > 0) {
      return user.selectedCharacter.images.map(img => ({
        src: img.url,
        alt: user.selectedCharacter.name,
        unlockLevel: img.unlockLevel || 0
      }));
    }
    
    // フォールバック：デフォルト画像
    return [
      { src: '/images/hero-images_01.png', alt: 'ヒーロー画像1', unlockLevel: 0 },
      { src: '/images/hero-images_02.png', alt: 'ヒーロー画像2', unlockLevel: 10 },
      { src: '/characters/luna.png', alt: 'ルナ', unlockLevel: 20 },
      { src: '/characters/miko.png', alt: 'ミコ', unlockLevel: 30 },
      { src: '/characters/robo.png', alt: 'ロボ', unlockLevel: 40 },
      { src: '/characters/zen.png', alt: 'ゼン', unlockLevel: 50 },
      { src: '/images/room_01.jpg', alt: 'ルーム画像1', unlockLevel: 60 },
      { src: '/images/room_02.jpg', alt: 'ルーム画像2', unlockLevel: 70 },
      { src: '/images/room_03.jpg', alt: 'ルーム画像3', unlockLevel: 80 },
      { src: '/images/room_04.jpg', alt: 'ルーム画像4', unlockLevel: 90 }
    ];
  };

  const sliderImages = getSliderImages();

  return (
    <div className={styles.dashboardRoot}>
      {/* ヘロー画像スライダー */}
      <div className={styles.sliderContainer}>
        <ImageSlider
          images={sliderImages}
          interval={4000}
          onImageClick={handleImageClick}
          affinityLevel={affinityData?.level || 0}
        />
      </div>
      
      {modalOpen && (
        <ImageModal
          images={sliderImages}
          initialIndex={modalInitialIndex}
          onClose={() => setModalOpen(false)}
          affinityLevel={affinityData?.level || 0}
        />
      )}

      {/* ダッシュボードコンテンツ */}
      <div className={styles.dashboardContainer}>
        {/* 上部セクション: 親密度 + キャラクターカード */}
        <div className={styles.topSection}>
          {/* 親密度バー */}
          {affinityData && (
            <div className={styles.affinityContainer}>
              <AffinityBar
                level={affinityData.level}
                streak={affinityData.streak}
                description={affinityData.description}
              />
            </div>
          )}

          {/* キャラクター情報カード */}
          <div className={styles.characterContainer}>
          {/* キャラクター情報カード */}
          <Card className={styles.characterCard}>
            <div className={styles.characterHeader}>
              <div className={styles.characterImageSection}>
                {user.selectedCharacter?.imageDashboard ? (
                  <div className={styles.imageContainer}>
                    <img
                      src={user.selectedCharacter.imageDashboard}
                      alt={user.selectedCharacter.name}
                      className={styles.characterImage}
                    />
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.placeholderIcon}>👤</div>
                    <span>画像なし</span>
                  </div>
                )}
              </div>
              
              <div className={styles.characterInfo}>
                <h1 className={styles.characterName}>
                  {typeof user.selectedCharacter?.name === 'object'
                    ? (user.selectedCharacter.name[locale] || user.selectedCharacter.name.ja || user.selectedCharacter.name.en || '')
                    : user.selectedCharacter?.name}
                </h1>
                
                {personalityTags.length > 0 && (
                  <div className={styles.personalitySection}>
                    <div className={styles.personalityHeader}>
                      <span className={styles.personalityLabel}>🎭 性格</span>
                    </div>
                    <div className={styles.personalityTags}>
                      {personalityTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`${styles.personalityTag} ${tag.isPreset ? styles.personalityPreset : styles.personalityNormal}`}
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.isPreset && '★'} {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.characterActions}>
                  <button
                    type="button"
                    onClick={() => {
                      if (buttonProps.type === 'purchase') {
                        router.push(`/${locale}/setup?reselect=true`);
                      } else if (buttonProps.type === 'upgrade') {
                        router.push(`/${locale}/setup?reselect=true`);
                      } else {
                        handleStartChat();
                      }
                    }}
                    className={`${styles.actionButton} ${
                      buttonProps.type === 'chat' ? styles.chatButton : styles.upgradeButton
                    }`}
                  >
                    <span className={styles.buttonIcon}>
                      {buttonProps.type === 'chat' ? '💬' : buttonProps.type === 'purchase' ? '🛒' : '⭐'}
                    </span>
                    {buttonProps.text}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleChangeCharacter}
                    className={styles.secondaryButton}
                  >
                    🔄 {tMenu('setup', 'キャラ変更')}
                  </button>
                </div>

                {user.selectedCharacter?.characterAccessType === 'purchaseOnly' && !isCharacterPurchased(user.selectedCharacter) && (
                  <div className={styles.priceInfo}>
                    💰 {t('price', '価格')}: <span className={styles.price}>¥{user.selectedCharacter.price.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
          </div>
        </div>

        {/* 詳細情報グリッド */}
          <div className={styles.detailsGrid}>
            {/* 性格詳細 */}
            <Card className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>
                  <span className={styles.detailIcon}>🎭</span>
                  {t('personality', '性格')}
                </h3>
              </div>
              <div className={styles.detailContent}>
                <p className={styles.detailText}>
                  {typeof user.selectedCharacter?.personalityPrompt === 'object'
                    ? (user.selectedCharacter.personalityPrompt[locale] || user.selectedCharacter.personalityPrompt.ja || user.selectedCharacter.personalityPrompt.en || t('no_info', '情報なし'))
                    : (user.selectedCharacter?.personalityPrompt || t('no_info', '情報なし'))}
                </p>
              </div>
            </Card>

            {/* 説明 */}
            <Card className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>
                  <span className={styles.detailIcon}>📖</span>
                  {t('description', '説明')}
                </h3>
              </div>
              <div className={styles.detailContent}>
                <p className={styles.detailText}>
                  {typeof user.selectedCharacter?.description === 'object'
                    ? (user.selectedCharacter.description[locale] || user.selectedCharacter.description.ja || user.selectedCharacter.description.en || t('no_info', '情報なし'))
                    : (user.selectedCharacter?.description || t('no_info', '情報なし'))}
                </p>
              </div>
            </Card>

            {/* 統計情報 */}
            {affinityData && (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>
                    <span className={styles.detailIcon}>📊</span>
                    統計情報
                  </h3>
                </div>
                <div className={styles.statsContent}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>親密度レベル</span>
                    <span className={styles.statValue}>{affinityData.level}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>連続日数</span>
                    <span className={styles.statValue}>{affinityData.streak}日</span>
                  </div>
                </div>
              </Card>
            )}

            {/* チャット制限情報（無料会員のみ） */}
            {user?.membershipType === 'free' && chatLimitInfo && (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>
                    <span className={styles.detailIcon}>💬</span>
                    チャット制限
                  </h3>
                </div>
                <div className={styles.detailContent}>
                  {chatLimitInfo.isLimitReached ? (
                    <div className={styles.limitReached}>
                      <p className={styles.limitText}>
                        😅 今日の無料チャット回数に達しました
                      </p>
                      <button
                        onClick={() => router.push(`/${locale}/purchase`)}
                        className={styles.upgradeButtonSmall}
                      >
                        🌟 プレミアム会員になる
                      </button>
                    </div>
                  ) : (
                    <p className={styles.remainingText}>
                      💬 今日あと <strong>{chatLimitInfo.remainingChats}</strong> 回チャットできます
                      {chatLimitInfo.remainingChats <= 2 && (
                        <span className={styles.warningText}><br />プレミアム会員で無制限に！</span>
                      )}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
      </div>
    </div>
  );
}
