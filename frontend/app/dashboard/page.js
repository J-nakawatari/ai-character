'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.hasCompletedSetup) {
      router.push('/setup');
    }
  }, [user, loading, router]);
  
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
      {/* Stylish navigation buttons */}
      <div className="floating-nav-buttons">
        <button 
          className="floating-nav-button back-button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push('/');
          }}
          aria-label="ホームに戻る"
        >
          <span className="nav-icon">←</span>
          <span className="nav-text">ホームに戻る</span>
        </button>
        <button 
          className="floating-nav-button logout-button" 
          onClick={handleLogout}
          aria-label="ログアウト"
        >
          <span className="nav-icon">⏻</span>
          <span className="nav-text">ログアウト</span>
        </button>
      </div>
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
              <button 
                className="character-reselect-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/setup');
                }}
              >
                キャラクターを変更する
              </button>
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
