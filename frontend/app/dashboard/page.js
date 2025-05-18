'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const canvasRef = useRef(null);
  const pathname = usePathname();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.hasCompletedSetup) {
      router.push('/setup');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (!loading && user) {
      console.log('Dashboard user data:', user);
      console.log('Selected character:', user.selectedCharacter);
    }
  }, [user, loading]);
  
  useEffect(() => {
    let animationId;
    let particles = [];
    let ctx, width, height, canvas;

    function setupCanvas() {
      canvas = canvasRef.current;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // パーティクル設定
      particles = [];
      const PARTICLE_NUM = 40;
      for (let i = 0; i < PARTICLE_NUM; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 60 + Math.random() * 40,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          alpha: 0.08 + Math.random() * 0.08,
          color: `hsl(${Math.random() * 360}, 70%, 85%)`
        });
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
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

    function handleResize() {
      setupCanvas();
    }

    setupCanvas();
    draw();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [pathname]);
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="chat-container">
      <canvas ref={canvasRef} id="bg-canvas" key={pathname}></canvas>
      {/* Stylish navigation buttons */}
      <button 
        className="floating-nav-button back-button" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push('/setup?reselect=true');
        }}
        aria-label="戻る"
      >
        <span className="nav-icon">←</span>
        <span className="nav-text">戻る</span>
      </button>
      <button 
        className="floating-nav-button logout-button" 
        onClick={handleLogout}
        aria-label="ログアウト"
      >
        <span className="nav-icon">⏻</span>
        <span className="nav-text">ログアウト</span>
      </button>
      
      <main className="chat-main" style={{ height: 'calc(100vh - 64px)', padding: '1.5rem' }}>
        <div className="dashboard-card card">
          <div className="dashboard-character-name">
            {user.selectedCharacter?.name || 'AIキャラクター'}
          </div>
          <div className="dashboard-main-row">
            {/* 左カラム：テキスト */}
            <div className="dashboard-col-text">
              <h2 className="dashboard-title">キャラクター詳細</h2>
              <div className="dashboard-section">
                <div className="dashboard-label">特長</div>
                <div className="dashboard-desc">{user.selectedCharacter?.description || '明るく元気な性格と創造的な発想を持つ、陽気なAIコンパニオン。'}</div>
                <div className="dashboard-label">性格</div>
                <div className="dashboard-personality">{user.selectedCharacter?.personality || 'Cheerful, creative, and engaging'}</div>
              </div>
            </div>
            {/* 右カラム：画像 */}
            <div className="dashboard-col-image">
              <img
                src={user.selectedCharacter?.imageUrl || '/images/character_01.png'}
                alt={user.selectedCharacter?.name || 'AIキャラクター'}
                className="dashboard-character-img"
              />
            </div>
          </div>
          {/* 下部ボタン */}
          <div className="dashboard-bottom">
            <Button 
              onClick={() => router.push('/chat')} 
              className="button w-full"
            >
              チャットを始める
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
