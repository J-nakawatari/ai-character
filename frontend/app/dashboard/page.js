'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import Button from '../components/Button';
import BackButton from '../components/BackButton';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
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
      <div className="dashboard__main">
        <div className="dashboard__card">
          <div className="dashboard__section-wrapper">
            <div className="dashboard__card--image">
              {user.selectedCharacter?.imageDashboard ? (
                <img
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
            <div className="dashboard__section-flex">
            <div className="dashboard__section">
                <h2 className="dashboard__label">名前</h2>
                <p className="dashboard__title">{user.selectedCharacter?.name}</p>
              </div>
              <div className="dashboard__section">
                <h2 className="dashboard__label">性格</h2>
                <div className="dashboard__personality-tags">
                  {personalityTags.map((tag, index) => (
                    <span key={index} className="dashboard__personality-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="dashboard__desc">
                  {user.selectedCharacter?.personalityPrompt || '情報なし'}
                </p>
              </div>
              <div className="dashboard__section">
                <h2 className="dashboard__label">説明</h2>
                <p className="dashboard__desc">
                  {user.selectedCharacter?.description || '情報なし'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartChat}
                className="button button--primary button--lg button--full button--chat-start"
              >
                チャットを始める
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
