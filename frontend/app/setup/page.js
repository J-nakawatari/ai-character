'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';
import api from '../utils/api';

const schema = z.object({
  name: z.string().min(2, 'お名前は2文字以上で入力してください'),
  characterId: z.string().min(1, 'AIキャラクターを選択してください'),
});

export default function Setup() {
  const { user, completeSetup, loading } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [serverError, setServerError] = useState('');
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

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
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await api.get('/characters');
        setCharacters(res.data);
      } catch (err) {
        setServerError('キャラクターの取得に失敗しました');
      } finally {
        setLoadingCharacters(false);
      }
    };
    fetchCharacters();
  }, []);

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
          console.log('ctx (delayed):', ctx);
          let width = window.innerWidth;
          let height = window.innerHeight;
          let animationId;

          function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            console.log('canvas resized (delayed)', width, height);
          }
          resize();
          window.addEventListener('resize', resize);

          // デバッグ: 赤い四角を描画
          ctx.fillStyle = 'red';
          ctx.fillRect(0, 0, 100, 100);

          // パーティクル設定
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
              // 動き
              p.x += p.dx;
              p.y += p.dy;
              // 画面外に出たら反対側へ
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
    // 通常の描画処理
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    console.log('ctx:', ctx);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      console.log('canvas resized', width, height);
    }
    resize();
    window.addEventListener('resize', resize);

    // デバッグ: 赤い四角を描画
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);

    // パーティクル設定
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
        // 動き
        p.x += p.dx;
        p.y += p.dy;
        // 画面外に出たら反対側へ
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
      router.push('/dashboard');
    } else {
      setServerError(result.error);
    }
  };

  if (loading || loadingCharacters) {
    return (
      <div className="setup--loading">
        <p>読み込み中...</p>
      </div>
    );
  }

  // 選択中キャラクター取得（右カラム用）
  const selectedCharacter = characters.find(c => c._id === selectedCharacterId) || characters[0];

  return (
    <div className="setup--root" style={{ position: 'relative', overflow: 'hidden' }}>
      <form className="setup--form" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="setup--section-title">
          AIキャラクターを選択してください
        </h2>
        <div className="setup--main">
          <div className="setup--card-list">
            {characters.slice(0, 4).map((character, idx) => (
              <div
                key={character._id}
                className="setup--character-card"
              >
                <div className="setup--character-img-wrapper">
                  <img
                    className="setup--character-img"
                    src={character.imageCharacterSelect || '/images/default.png'}
                    alt={character.name}
                  />
                  <img
                    className="voiceicon"
                    src="/images/voice.png"
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
                <div className="setup--character-name">{character.name}</div>
                <div className="setup--character-tags">
                  {(character.personality || character.personalityPrompt) ? 
                    (character.personality || character.personalityPrompt).split(/,| /).map((tag, idx) =>
                      tag.trim() && (
                        <span className="setup--character-tag" key={idx}>{tag.trim()}</span>
                      )
                    ) : []
                  }
                </div>
                <div className="setup--character-desc">{character.description}</div>
                <button
                  type="button"
                  className="setup--select-btn"
                  disabled={selectedCharacterId === character._id}
                  onClick={async () => {
                    setValue('characterId', character._id);
                    setServerError('');
                    const result = await completeSetup({
                      name: watch('name'),
                      characterId: character._id
                    });
                    if (result.success) {
                      router.push('/dashboard');
                    } else {
                      setServerError(result.error);
                    }
                  }}
                >
                  このキャラを選択する
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
