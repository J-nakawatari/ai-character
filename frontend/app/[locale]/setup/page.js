'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';
import { useTranslations } from 'next-intl';
import '../../styles/pages/setup.css';
import GlobalLoading from '../../components/GlobalLoading';

const schema = z.object({
  name: z.string().min(2, 'お名前は2文字以上で入力してください'),
  characterId: z.string().min(1, 'AIキャラクターを選択してください'),
});

export default function Setup({ params }) {
  const { user, completeSetup, loading } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [serverError, setServerError] = useState('');
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const t = useTranslations('setup');
  const appT = useTranslations('app');
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [modalCharacter, setModalCharacter] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      characterId: '',
    },
  });

  const selectedCharacterId = watch('characterId');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const isReselect = queryParams.get('reselect') === 'true';
    
    if (!loading && user?.hasCompletedSetup && !isReselect) {
      router.push(`/${locale}/dashboard`);
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    if (loading) return; // wait for auth state

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const fetchCharacters = async () => {
      try {
        const res = await api.get('/characters');
        setCharacters(res.data);
        console.log('キャラクター取得結果:', res.data); 
      } catch (err) {
        setServerError('キャラクターの取得に失敗しました');
      } finally {
        setLoadingCharacters(false);
      }
    };
    fetchCharacters();
  }, [loading, user, router, locale]);

  useEffect(() => {
    if (user?.name) {
      setValue('name', user.name);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!canvasRef.current) {
      setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          let width = window.innerWidth;
          let height = window.innerHeight;
          let animationId;

          function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
          }
          resize();
          window.addEventListener('resize', resize);

          const particles = [];
          const PARTICLE_NUM = 40;
          for (let i = 0; i < PARTICLE_NUM; i++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              r: 40 + Math.random() * 30,
              dx: (Math.random() - 0.5) * 0.5,
              dy: (Math.random() - 0.5) * 0.5,
              alpha: 0.12 + Math.random() * 0.1,
              color: `hsl(${Math.random() * 360}, 60%, 90%)`
            });
          }

          function draw() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < PARTICLE_NUM; i++) {
              const p = particles[i];
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
              ctx.closePath();
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 40;
              ctx.fill();
              ctx.globalAlpha = 1;
              ctx.shadowBlur = 0;
              p.x += p.dx;
              p.y += p.dy;
              if (p.x < -p.r) p.x = width + p.r;
              if (p.x > width + p.r) p.x = -p.r;
              if (p.y < -p.r) p.y = height + p.r;
              if (p.y > height + p.r) p.y = -p.r;
            }
            animationId = requestAnimationFrame(draw);
          }
          draw();

          return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
          };
        }
      }, 100);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const PARTICLE_NUM = 40;
    for (let i = 0; i < PARTICLE_NUM; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 40 + Math.random() * 30,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        alpha: 0.12 + Math.random() * 0.1,
        color: `hsl(${Math.random() * 360}, 60%, 90%)`
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < PARTICLE_NUM; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 40;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const onSubmit = async (data) => {
    setServerError('');
    const result = await completeSetup(data);
    if (result.success) {
      router.push(`/${locale}/dashboard`);
    } else {
      setServerError(result.error);
    }
  };

  const handleCharacterSelect = async (character) => {
    try {
      // キャラクターの種類に応じたチェック
      if (character.characterType === 'paid') {
        const isPurchased = user.purchasedCharacters.some(
          pc => pc.character._id === character._id && pc.purchaseType === 'buy'
        );
        
        if (!isPurchased) {
          // 未購入の場合は購入ページに遷移
          router.push(`/${locale}/purchase/${character._id}`);
          return;
        }
      } else if (character.characterType === 'premium') {
        if (user.membershipType !== 'premium' || user.subscriptionStatus !== 'active') {
          // プレミアム会員でない場合はアップグレードページに遷移
          router.push(`/${locale}/upgrade`);
          return;
        }
      }

      // 購入済みまたは無料キャラクターの場合は選択を完了
      setValue('characterId', character._id);
      setServerError('');
      const result = await completeSetup({
        name: watch('name'),
        characterId: character._id
      });
      
      if (result.success) {
        const queryParams = new URLSearchParams(window.location.search);
        const isReselect = queryParams.get('reselect') === 'true';
        if (isReselect) {
          router.push(`/${locale}/chat`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      } else {
        setServerError(result.error);
      }
    } catch (err) {
      console.error('キャラクターの選択に失敗しました', err);
      setServerError(t('character_select_failed', 'キャラクターの選択に失敗しました'));
    }
  };

  // キャラクターの購入状態をチェックする関数
  const isCharacterPurchased = (character) => {
    if (!character || !user.purchasedCharacters) return false;
    return user.purchasedCharacters.some(
      pc => pc.character._id === character._id && pc.purchaseType === 'buy'
    );
  };

  // ボタンの表示テキストとタイプを取得する関数
  const getButtonProps = (character) => {
    if (character.characterType === 'paid' && !isCharacterPurchased(character)) {
      return {
        text: t('purchase_character', '購入する'),
        type: 'purchase'
      };
    } else if (character.characterType === 'premium' && 
               (user.membershipType !== 'premium' || user.subscriptionStatus !== 'active')) {
      return {
        text: t('upgrade_to_premium', 'プレミアムにアップグレード'),
        type: 'upgrade'
      };
    }
    return {
      text: t('select_button', '選択する'),
      type: 'select'
    };
  };

  // 購入モーダルを開く
  const openPurchaseModal = (character) => {
    setModalCharacter(character);
    setShowPurchaseModal(true);
  };
  // 購入モーダルを閉じる
  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setModalCharacter(null);
  };

  // 購入確定処理（仮実装）
  const handleConfirmPurchase = async () => {
    if (!modalCharacter) return;
    // ここで購入APIを呼ぶ
    // await api.post(`/purchase`, { characterId: modalCharacter._id });
    closePurchaseModal();
    window.location.reload();
  };

  const openUpgradeModal = () => {
    setShowUpgradeModal(true);
  };
  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };
  const handleConfirmUpgrade = async () => {
    // ここでサブスクAPIを呼ぶ（仮実装）
    closeUpgradeModal();
    window.location.reload();
  };

  if (loading || loadingCharacters) {
    return <GlobalLoading text={t('loading')} />;
  }

  const selectedCharacter = characters.find(c => c._id === selectedCharacterId) || characters[0];

  return (
    <div className="setup--root">
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}></canvas>
      
      <div className="setup--header">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>
      
      <form className="setup--form" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="setup--section-title">
          {t('select_character')}
        </h2>
        <div className="setup--main">
          <div className="setup--card-list">
            {characters.slice(0, 4).map((character, idx) => {
              const characterName = character.name && typeof character.name === 'object' 
                ? (character.name[locale] || character.name.ja || character.name) 
                : character.name;
              
              const characterDesc = character.description && typeof character.description === 'object'
                ? (character.description[locale] || character.description.ja || character.description)
                : character.description;
              
              const buttonProps = getButtonProps(character);

              return (
                <div
                  key={character._id}
                  className="setup--character-card"
                >
                  <div className="setup--character-img-wrapper">
                    <img
                      className="setup--character-img"
                      src={character.imageCharacterSelect || '/images/default.png'}
                      alt={characterName}
                    />
                    <img
                      className="voiceicon"
                      src="/images/voice.svg"
                      alt="ボイス"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                        }
                        const audioSrc = character.sampleVoiceUrl || `/voice/voice_0${idx + 1}.wav`;
                        const audio = new Audio(audioSrc);
                        audioRef.current = audio;
                        audio.play();
                      }}
                    />
                  </div>
                  <div className="setup--character-name">{characterName}</div>
                  <div className="setup--character-tags">
                    {(character.personality || character.personalityPrompt) ?
                      ((() => {
                        let personalityText = character.personality || '';
                        if (!personalityText && character.personalityPrompt) {
                          if (typeof character.personalityPrompt === 'object') {
                            personalityText = character.personalityPrompt[locale] || character.personalityPrompt.ja || character.personalityPrompt.en || '';
                          } else {
                            personalityText = character.personalityPrompt;
                          }
                        }
                        return personalityText.split(/,| /).map((tag, idx) =>
                          tag.trim() && (
                            <span className="setup--character-tag" key={idx}>{tag.trim()}</span>
                          )
                        );
                      })()) : []}
                  </div>
                  <div className="setup--character-desc">{characterDesc}</div>
                  <button
                    type="button"
                    className="setup--select-btn"
                    data-type={buttonProps.type}
                    onClick={() => {
                      if (buttonProps.type === 'purchase') {
                        openPurchaseModal(character);
                      } else if (buttonProps.type === 'upgrade') {
                        openUpgradeModal();
                      } else {
                        handleCharacterSelect(character);
                      }
                    }}
                  >
                    {buttonProps.text}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </form>
      {/* 購入モーダル */}
      {showPurchaseModal && modalCharacter && (
        <div className="setup--modal-overlay" onClick={closePurchaseModal}>
          <div className="setup--modal-content" onClick={e => e.stopPropagation()}>
            <button className="setup--modal-close" onClick={closePurchaseModal} aria-label="閉じる">×</button>
            <h2 className="setup--modal-title">{modalCharacter.name[locale] || modalCharacter.name.ja || modalCharacter.name}</h2>
            <img
              src={modalCharacter.imageCharacterSelect || '/images/character-placeholder.png'}
              alt={modalCharacter.name[locale] || modalCharacter.name.ja || modalCharacter.name}
              className="setup--modal-img"
            />
            <div className="setup--modal-detail">
              <div className="setup--modal-price">
                <b>{t('price')}:</b>
                <span className="setup--modal-price-value">¥{modalCharacter.price.toLocaleString()}</span>
              </div>
              <div className="setup--modal-type"><b>{t('type')}:</b> {modalCharacter.purchaseType === 'buy' ? t('buy_type_buy') : t('buy_type_rental')}</div>
              <div className="setup--modal-desc">{modalCharacter.description[locale] || modalCharacter.description.ja || modalCharacter.description}</div>
            </div>
            <div className="setup--modal-buttons">
              <button className="setup--modal-cancel" onClick={closePurchaseModal}>{t('cancel')}</button>
              <button className="setup--modal-confirm" onClick={handleConfirmPurchase}>{t('confirm_purchase')}</button>
            </div>
          </div>
        </div>
      )}
      {showUpgradeModal && (
        <div className="setup--modal-overlay" onClick={closeUpgradeModal}>
          <div className="setup--modal-content setup--modal-content-upgrade" onClick={e => e.stopPropagation()}>
            <button className="setup--modal-close" onClick={closeUpgradeModal} aria-label="閉じる">×</button>
            <h2 className="setup--modal-title">{t('upgrade_to_premium')}</h2>
            <div className="setup--modal-detail">
              <div style={{ marginBottom: '12px' }}>{t('premium_modal_description')}</div>
              <div className="setup--modal-price setup--modal-price-center">
                <span className="setup--modal-price-label">{t('premium_price_period', '月額')}</span>
                <span className="setup--modal-price-value">980円</span>
                <span className="setup--modal-price-tax">（税込）</span>
              </div>
            </div>
            <div className="setup--modal-buttons">
              <button className="setup--modal-cancel" onClick={closeUpgradeModal}>{t('cancel')}</button>
              <button className="setup--modal-confirm" data-type="upgrade" onClick={handleConfirmUpgrade}>{t('upgrade_to_premium')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
