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
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">AIキャラクターダッシュボード</h1>
          <Button onClick={handleLogout}>ログアウト</Button>
        </div>
      </header>
      
      <main className="chat-main">
        <div className="chat-character-info">
          <div className="chat-character-avatar">
            {user.selectedCharacter?.imageUrl ? (
              <Image
                src={user.selectedCharacter.imageUrl}
                alt={user.selectedCharacter.name}
                width={64}
                height={64}
                className="object-cover rounded-full"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl">
                {user.selectedCharacter?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          
          <div className="chat-character-details">
            <h2 className="chat-character-name">{user.name}さん、ようこそ！</h2>
            <p className="chat-character-personality">
              {user.selectedCharacter?.name || 'あなたのAIキャラクター'}と交流中です
            </p>
          </div>
        </div>
        
        <div className="chat-messages-container">
          <div className="chat-messages-list">
            {user.selectedCharacter && (
              <div className="chat-welcome">
                <h3 className="font-medium mb-2">キャラクター詳細</h3>
                <p className="mb-2">{user.selectedCharacter.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">性格：</span> {user.selectedCharacter.personality}
                </p>
              </div>
            )}
          </div>
          
          <div className="chat-input-container">
            <div className="chat-input-form">
              <Button 
                onClick={() => router.push('/chat')} 
                className="chat-send-button w-full"
              >
                チャットを始める
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
