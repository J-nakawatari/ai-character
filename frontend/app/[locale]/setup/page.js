'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useRequireAuth from '../../utils/useRequireAuth';
import { apiGet, apiPut } from '../../utils/api';
import { useTranslations } from 'next-intl';
import '../../styles/pages/setup.css';
import GlobalLoading from '../../components/GlobalLoading';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../utils/auth';
import AffinityInfo from '../../components/AffinityInfo';

const schema = z.object({
  name: z.string().min(2, 'お名前は2文字以上で入力してください'),
  characterId: z.string().min(1, 'AIキャラクターを選択してください'),
});

export default function Setup({ params }) {
  const auth = useAuth();
  const { user, loading, element, completeSetup } = auth || {};
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [serverError, setServerError] = useState('');
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [affinityData, setAffinityData] = useState({});
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const t = useTranslations('setup');
  const appT = useTranslations('app');
  const { locale } = typeof params.then === 'function' ? use(params) : params;

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
    if (loading) return; // wait for auth state
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    const fetchCharacters = async () => {
      const res = await apiGet('/characters');
      if (res.success) {
        setCharacters(res.data);
        console.log('キャラクター取得結果:', res.data); 
        
        // 各キャラクターの親密度データを取得
        const affinityPromises = res.data.map(async (character) => {
          try {
            const affinityRes = await fetch(`/api/users/me/affinity/${character._id}`, {
              headers: {
                'x-auth-token': localStorage.getItem('token')
              }
            });
            if (affinityRes.ok) {
              const data = await affinityRes.json();
              return { characterId: character._id, data };
            }
          } catch (err) {
            console.error(`Failed to fetch affinity for character ${character._id}:`, err);
          }
          return { characterId: character._id, data: { level: 0, description: { title: "初対面", color: "#C0C0C0" } } };
        });
        
        const affinityResults = await Promise.all(affinityPromises);
        const affinityMap = {};
        affinityResults.forEach(result => {
          affinityMap[result.characterId] = result.data;
        });
        setAffinityData(affinityMap);
      } else {
        setServerError('キャラクターの取得に失敗しました');
      }
      setLoadingCharacters(false);
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

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('subscribed') === 'true') {
      queryParams.delete('subscribed');
      const newUrl =
        window.location.pathname +
        (queryParams.toString() ? '?' + queryParams.toString() : '');
      window.history.replaceState(null, '', newUrl);
    }
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
      // 新しいトークン制システムでは全てのキャラクターが選択可能
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


  // ボタンの表示テキストとタイプを取得する関数
  const getButtonProps = (character) => {
    // 新しいトークン制システムでは全てのキャラクターが選択可能
    return {
      text: t('select_button', '選択する'),
      type: 'select'
    };
  };


  if (element) return element;
  if (!user) return null;

  if (loading || loadingCharacters) {
    return <GlobalLoading text={t('loading')} />;
  }

  const selectedCharacter = characters.find(c => c._id === selectedCharacterId) || characters[0];

  return (
    <div className="setup--root">
      <canvas ref={canvasRef} className="setup--background-canvas"></canvas>
      
      {/* ヘッダー */}
      <div className="setup--header">
        <div className="setup--header-content">
          <h1 className="setup--title">
            <span className="setup--title-icon">🎭</span>
            {t('title')}
          </h1>
        </div>
      </div>

      {/* エラー表示 */}
      {serverError && (
        <div className="setup--error-container">
          <ErrorMessage
            message={serverError}
            type="toast"
            className="setup-error-message"
          />
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="setup--main">
        <div className="setup--character-grid">
          {characters.map((character, idx) => {
            const characterName = character.name && typeof character.name === 'object' 
              ? (character.name[locale] || character.name.ja || character.name) 
              : character.name;
            
            const characterDesc = character.description && typeof character.description === 'object'
              ? (character.description[locale] || character.description.ja || character.description)
              : character.description;
            
            const buttonProps = getButtonProps(character);
            const characterAffinity = affinityData[character._id];

            return (
              <div
                key={character._id}
                className="setup--character-card"
              >
                {/* トークン制対応バッジ */}
                <div className="setup--access-badge">
                  {character.isBaseCharacter ? (
                    <span className="setup--badge setup--badge--free">🆓 無料 (5回/日)</span>
                  ) : (
                    <div className="setup--badge-group">
                      <span className="setup--badge setup--badge--token">💎 トークン制</span>
                      {character.model === 'gpt-4' && (
                        <span className="setup--badge setup--badge--premium">⚡ GPT-4</span>
                      )}
                    </div>
                  )}
                  
                  {/* 旧システム互換性（フォールバック） */}
                  {!character.hasOwnProperty('isBaseCharacter') && (
                    <>
                      {character.characterAccessType === 'free' && (
                        <span className="setup--badge setup--badge--free">🆓 無料</span>
                      )}
                      {character.characterAccessType === 'subscription' && (
                        <span className="setup--badge setup--badge--premium">👑 プレミアム</span>
                      )}
                      {character.characterAccessType === 'purchaseOnly' && (
                        <span className="setup--badge setup--badge--purchase">💎 購入</span>
                      )}
                    </>
                  )}
                </div>

                {/* キャラクター画像 */}
                <div className="setup--character-image-container">
                  <img
                    className="setup--character-image"
                    src={character.imageCharacterSelect || '/images/default.png'}
                    alt={characterName}
                  />
                  
                  {/* 音声再生ボタン */}
                  <button
                    type="button"
                    className="setup--voice-button"
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
                  >
                    🎵
                  </button>

                </div>

                {/* キャラクター情報 */}
                <div className="setup--character-info">
                  <h3 className="setup--character-name">{characterName}</h3>
                  
                  {/* 親密度情報 */}
                  {characterAffinity && (
                    <div className="setup--affinity-container">
                      <AffinityInfo 
                        level={characterAffinity.level} 
                        description={characterAffinity.description}
                      />
                    </div>
                  )}

                  {/* 性格タグ（新しいフィールド対応） */}
                  <div className="setup--character-tags">
                    {(() => {
                      const tags = [];
                      
                      // 新しい性格プリセットを追加
                      if (character.personalityPreset) {
                        tags.push(
                          <span key="preset" className="setup--character-tag setup--character-tag--preset">
                            ★ {character.personalityPreset}
                          </span>
                        );
                      }
                      
                      // 新しい性格タグを追加（最大2つ）
                      if (character.personalityTags && Array.isArray(character.personalityTags)) {
                        character.personalityTags.slice(0, 2).forEach((tag, tagIdx) => {
                          tags.push(
                            <span key={`tag-${tagIdx}`} className="setup--character-tag setup--character-tag--normal">
                              {tag}
                            </span>
                          );
                        });
                      }
                      
                      // 旧形式のフォールバック
                      if (tags.length === 0 && (character.personality || character.personalityPrompt)) {
                        let personalityText = character.personality || '';
                        if (!personalityText && character.personalityPrompt) {
                          if (typeof character.personalityPrompt === 'object') {
                            personalityText = character.personalityPrompt[locale] || character.personalityPrompt.ja || character.personalityPrompt.en || '';
                          } else {
                            personalityText = character.personalityPrompt;
                          }
                        }
                        personalityText.split(/,| /).slice(0, 3).forEach((tag, tagIdx) => {
                          if (tag.trim()) {
                            tags.push(
                              <span key={`old-${tagIdx}`} className="setup--character-tag setup--character-tag--old">
                                {tag.trim()}
                              </span>
                            );
                          }
                        });
                      }
                      
                      return tags;
                    })()}
                  </div>

                  {/* 説明 */}
                  <p className="setup--character-desc">{characterDesc}</p>


                  {/* 選択ボタン */}
                  <button
                    type="button"
                    className={`setup--select-button setup--select-button--${buttonProps.type}`}
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <span className="setup--button-icon">✨</span>
                    {buttonProps.text}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
