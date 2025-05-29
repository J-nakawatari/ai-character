'use client';

import { useEffect, use } from 'react';
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


export default function Dashboard({ params }) {
  const { user, loading, element } = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useParams();
  const locale = urlParams.locale || 'ja';
  const t = useTranslations('dashboard');
  const tMenu = useTranslations('menu');
  
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
  
  const generatePersonalityTags = () => {
    if (!user.selectedCharacter?.personalityPrompt) return [];
    
    const personalityWords = [
      '明るい', '優しい', '厳しい', '真面目', '陽気', '冷静', '情熱的', 
      '穏やか', '活発', '慎重', '大胆', '繊細', '強気', '優雅', '知的',
      '謙虚', '誠実', '勇敢', '忠実', '思いやり', '几帳面', '自由', '創造的'
    ];
    
    let text = user.selectedCharacter.personalityPrompt;
    if (typeof text === 'object') {
      text = text[locale] || text.ja || text.en || '';
    }
    text = (text || '').toLowerCase();
    
    const tags = [];
    personalityWords.forEach(word => {
      if (text.includes(word.toLowerCase())) {
        tags.push(word);
      }
    });
    
    return tags.slice(0, 5);
  };
  
  const personalityTags = generatePersonalityTags();

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

  return (
    <div className={styles.dashboardRoot}>
      <Card className={styles.dashboardCard}>
        <div className={styles.dashboardGrid}>
          <div className={styles.dashboardImageWrapper}>
            <ImageSlider
              images={[
                { src: '/images/room_01.jpg', alt: 'ルーム画像1' },
                { src: '/images/room_02.jpg', alt: 'ルーム画像2' },
                { src: '/images/room_03.jpg', alt: 'ルーム画像3' },
                { src: '/images/room_04.jpg', alt: 'ルーム画像4' }
              ]}
              interval={4000}
            />
            {user.selectedCharacter?.imageDashboard ? (
              <img
                src={user.selectedCharacter.imageDashboard}
                alt={user.selectedCharacter.name}
                width={320}
                height={400}
                className={styles.dashboardCharacterImg}
              />
            ) : (
              <div className={styles.dashboardCharacterImgPlaceholder}>
                画像がありません
              </div>
            )}
          </div>
          <div className={styles.dashboardInfoSection}>
            <section className={styles.dashboardSection}>
              <h2 className={styles.dashboardLabel}>{t('name', '名前')}</h2>
              <p className={styles.dashboardTitle}>{
                typeof user.selectedCharacter?.name === 'object'
                  ? (user.selectedCharacter.name[locale] || user.selectedCharacter.name.ja || user.selectedCharacter.name.en || '')
                  : user.selectedCharacter?.name
              }</p>
            </section>
            <section className={styles.dashboardSection}>
              <h2 className={styles.dashboardLabel}>{t('personality', '性格')}</h2>
              <div className={styles.dashboardPersonalityTags}>
                {personalityTags.map((tag, index) => (
                  <span key={index} className={styles.dashboardPersonalityTag}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className={styles.dashboardDesc}>
                {typeof user.selectedCharacter?.personalityPrompt === 'object'
                  ? (user.selectedCharacter.personalityPrompt[locale] || user.selectedCharacter.personalityPrompt.ja || user.selectedCharacter.personalityPrompt.en || t('no_info', '情報なし'))
                  : (user.selectedCharacter?.personalityPrompt || t('no_info', '情報なし'))}
              </p>
            </section>
            <section className={styles.dashboardSection}>
              <h2 className={styles.dashboardLabel}>{t('description', '説明')}</h2>
              <p className={styles.dashboardDesc}>
                {typeof user.selectedCharacter?.description === 'object'
                  ? (user.selectedCharacter.description[locale] || user.selectedCharacter.description.ja || user.selectedCharacter.description.en || t('no_info', '情報なし'))
                  : (user.selectedCharacter?.description || t('no_info', '情報なし'))}
              </p>
            </section>
            <div className={styles.dashboardButtonWrapper}>
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
                className={buttonProps.type === 'chat' ? styles.dashboardPrimaryButton : styles.dashboardSecondaryButton}
              >
                {buttonProps.text}
              </button>
              {user.selectedCharacter?.characterAccessType === 'purchaseOnly' && !isCharacterPurchased(user.selectedCharacter) && (
                <div className={styles.dashboardPrice}>
                  {t('price', '価格')}: ¥{user.selectedCharacter.price.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
