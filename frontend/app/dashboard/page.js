'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import BackButton from '../components/BackButton';

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
        r: 60 + Math.random() * 40,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: 0.08 + Math.random() * 0.08,
        color: `hsl(${Math.random() * 360}, 70%, 85%)`
      });
    }

    function draw() {
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
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [pathname]);
  
  const handleStartChat = () => {
    router.push('/chat');
  };
  
  const handleChangeCharacter = () => {
    router.push('/setup?reselect=true');
  };
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };
  
  if (loading || !user) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <p>読み込み中...</p>
        </div>
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
    
    const tags = [];
    const text = user.selectedCharacter.personalityPrompt.toLowerCase();
    
    personalityWords.forEach(word => {
      if (text.includes(word.toLowerCase())) {
        tags.push(word);
      }
    });
    
    return tags.slice(0, 5);
  };
  
  const personalityTags = generatePersonalityTags();
  
  return (
    <div className="dashboard">
      <BackButton to="/setup" />
      <canvas ref={canvasRef} className="dashboard__bg-canvas"></canvas>
      
      <div className="dashboard__card">
        <h1 className="dashboard__character-name">{user.selectedCharacter?.name}</h1>
        
        <div className="dashboard__main-row">
          <div className="dashboard__col-text">
            <div className="dashboard__col-wrapper">
              <div className="dashboard__section">
                <h2 className="dashboard__label">性格</h2>
                <div className="dashboard__personality-tags">
                  {personalityTags.map((tag, index) => (
                    <span key={index} className="dashboard__personality-tag">{tag}</span>
                  ))}
                </div>
                <p className="dashboard__personality">{user.selectedCharacter?.personalityPrompt || '情報なし'}</p>
              </div>
              
              <div className="dashboard__section">
                <h2 className="dashboard__label">説明</h2>
                <p className="dashboard__desc">{user.selectedCharacter?.description || '情報なし'}</p>
              </div>
              
              <button 
                onClick={handleStartChat} 
                className="button button--primary button--lg button--full"
              >
                チャットを始める
              </button>
              
              <button 
                onClick={handleChangeCharacter} 
                className="button button--outline button--full mt-3"
              >
                キャラクターを変更する
              </button>
            </div>
          </div>
          
          <div className="dashboard__col-image">
            <div className="dashboard__col-wrapper">
              {user.selectedCharacter?.imageDashboard ? (
                <Image
                  src={user.selectedCharacter.imageDashboard}
                  alt={user.selectedCharacter.name}
                  width={320}
                  height={400}
                  className="dashboard__character-img"
                />
              ) : (
                <div className="dashboard__character-img dashboard__character-img--placeholder">
                  画像がありません
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard__bottom">
          <button 
            onClick={handleLogout} 
            className="button button--secondary button--sm"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}
