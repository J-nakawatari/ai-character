'use client';

import { useEffect, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../utils/auth';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';

export default function Dashboard({ params }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const t = useTranslations('dashboard');
  
  const handleStartChat = () => {
    router.push(`/${locale}/chat`);
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
  
  if (loading || !user) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <p>{t('loading', 'Loading...')}</p>
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
    
    // personalityPromptがオブジェクトの場合は言語に応じたプロパティを参照
    let text = '';
    if (typeof user.selectedCharacter.personalityPrompt === 'object') {
      text = user.selectedCharacter.personalityPrompt[locale] || 
             user.selectedCharacter.personalityPrompt.ja || 
             user.selectedCharacter.personalityPrompt.en || '';
    } else {
      text = user.selectedCharacter.personalityPrompt || '';
    }
    
    text = text.toLowerCase();
    
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
                <h2 className="dashboard__label">{t('name', '名前')}</h2>
                <p className="dashboard__title">{user.selectedCharacter?.name}</p>
              </div>
              <div className="dashboard__section">
                <h2 className="dashboard__label">{t('personality', '性格')}</h2>
                <div className="dashboard__personality-tags">
                  {personalityTags.map((tag, index) => (
                    <span key={index} className="dashboard__personality-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="dashboard__desc">
                  {user.selectedCharacter?.personalityPrompt || t('no_info', '情報なし')}
                </p>
              </div>
              <div className="dashboard__section">
                <h2 className="dashboard__label">{t('description', '説明')}</h2>
                <p className="dashboard__desc">
                  {user.selectedCharacter?.description || t('no_info', '情報なし')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartChat}
                className="button button--primary button--lg button--full button--chat-start"
              >
                {t('start_chat', 'チャットを始める')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
