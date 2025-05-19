'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import BackButton from '../components/BackButton';

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
    if (!canvasRef.current) return;
    
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
      <div className="setup">
        <div className="setup__loading">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="setup">
      <canvas ref={canvasRef} className="setup__bg-canvas"></canvas>
      <BackButton to="/" />
      
      <form className="setup__form" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="setup__title">
          AIキャラクターを選択してください
        </h2>
        
        <div className="setup__character-grid">
          {characters.slice(0, 4).map((character, idx) => (
            <div
              key={character._id}
              className={`setup__character-card ${selectedCharacterId === character._id ? 'setup__character-card--selected' : ''}`}
            >
              <div className="setup__character-img-wrapper">
                <img
                  className="setup__character-img"
                  src={character.imageCharacterSelect || '/images/default.png'}
                  alt={character.name}
                />
                <button
                  type="button"
                  className="setup__voice-button"
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
                  <span className="setup__voice-icon">🔊</span>
                </button>
              </div>
              
              <h3 className="setup__character-name">{character.name}</h3>
              
              <div className="setup__character-tags">
                {(character.personality || character.personalityPrompt) ? 
                  (character.personality || character.personalityPrompt).split(/,| /).map((tag, idx) =>
                    tag.trim() && (
                      <span className="setup__character-tag" key={idx}>{tag.trim()}</span>
                    )
                  ) : []
                }
              </div>
              
              <p className="setup__character-desc">{character.description}</p>
              
              <button
                type="button"
                className={`setup__select-button ${selectedCharacterId === character._id ? 'setup__select-button--selected' : ''}`}
                disabled={selectedCharacterId === character._id}
                onClick={() => setValue('characterId', character._id)}
              >
                {selectedCharacterId === character._id ? '選択中' : 'このキャラを選択する'}
              </button>
            </div>
          ))}
        </div>
        
        {errors.characterId && <p className="input__error-message">{errors.characterId.message}</p>}
        
        <button
          type="submit"
          className="setup__complete-button"
          disabled={isSubmitting || !selectedCharacterId || !watch('name')}
        >
          セットアップを完了する
        </button>
        
        {serverError && <div className="input__error-message mt-3">{serverError}</div>}
      </form>
    </div>
  );
}
