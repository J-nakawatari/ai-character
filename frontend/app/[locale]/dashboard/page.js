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
  
  // 性格タグ生成関数
  const generatePersonalityTags = useCallback((availableTags) => {
    if (!user?.selectedCharacter?.personalityPrompt || !availableTags.length) {
      setPersonalityTags([]);
      return;
    }
    
    let text = user.selectedCharacter.personalityPrompt;
    if (typeof text === 'object') {
      text = text[locale] || text.ja || text.en || '';
    }
    text = (text || '').toLowerCase();
    
    const matchedTags = [];
    availableTags.forEach(tag => {
      if (text.includes(tag.name.toLowerCase())) {
        matchedTags.push(tag);
      }
    });
    
    setPersonalityTags(matchedTags.slice(0, 5));
  }, [user?.selectedCharacter?.personalityPrompt, locale]);
  
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
    
    const fetchPersonalityTags = async () => {
      try {
        const response = await fetch(`/api/personality-tags?locale=${locale}`);
        if (response.ok) {
          const tags = await response.json();
          generatePersonalityTags(tags);
        }
      } catch (err) {
        console.error('Failed to fetch personality tags:', err);
        // フォールバック: ハードコーディングされたタグを使用
        const fallbackTags = [
          { name: '明るい', color: '#FFB347' },
          { name: '優しい', color: '#98D8C8' },
          { name: '厳しい', color: '#F06292' },
          { name: '真面目', color: '#6495ED' },
          { name: '陽気', color: '#FFD700' },
          { name: '冷静', color: '#87CEEB' },
          { name: '情熱的', color: '#FF6347' },
          { name: '穏やか', color: '#90EE90' },
          { name: '活発', color: '#FF7F50' },
          { name: '慎重', color: '#DDA0DD' },
          { name: '大胆', color: '#DC143C' },
          { name: '繊細', color: '#FFB6C1' },
          { name: '強気', color: '#FF4500' },
          { name: '優雅', color: '#DEB887' },
          { name: '知的', color: '#4169E1' },
          { name: '謙虚', color: '#8FBC8F' },
          { name: '誠実', color: '#5F9EA0' },
          { name: '勇敢', color: '#B22222' },
          { name: '忠実', color: '#2E8B57' },
          { name: '思いやり', color: '#DA70D6' },
          { name: '几帳面', color: '#708090' },
          { name: '自由', color: '#00CED1' },
          { name: '創造的', color: '#9370DB' }
        ];
        generatePersonalityTags(fallbackTags);
      }
    };
    
    fetchAffinity();
    fetchPersonalityTags();
  }, [user?.selectedCharacter?._id, locale, generatePersonalityTags]);
  
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
                    <div className={styles.imageOverlay}>
                      <div className={styles.characterStatus}>
                        <span className={styles.statusIcon}>🟢</span>
                        <span className={styles.statusText}>オンライン</span>
                      </div>
                    </div>
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
                    <div className={styles.personalityTags}>
                      {personalityTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={styles.personalityTag}
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
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
          </div>
      </div>
    </div>
  );
}
