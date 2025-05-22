'use client';

import { useEffect, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../utils/auth';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';
// モックデータをインポート
import { mockCharacters, mockUser } from '../../utils/mockData';

export default function Dashboard({ params }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const t = useTranslations('dashboard');
  
  // モックユーザーデータを作成
  const mockUserWithCharacter = {
    ...mockUser,
    hasCompletedSetup: true,
    selectedCharacter: mockCharacters[0] // 最初のキャラクターを選択したと仮定
  };
  
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
  
  // ローディング中またはユーザーデータがない場合はローディング表示
  // モックデータを使用するため、常にモックユーザーデータを表示する
  if (false) { // 常にfalseになるようにして、ローディング表示をスキップ
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <p>{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }
  
  // 実際のユーザーデータがある場合はそれを使用し、なければモックデータを使用
  const displayUser = user || mockUserWithCharacter;
  
  const generatePersonalityTags = () => {
    if (!displayUser.selectedCharacter?.personalityPrompt) return [];
    
    const personalityWords = [
      '明るい', '優しい', '厳しい', '真面目', '陽気', '冷静', '情熱的', 
      '穏やか', '活発', '慎重', '大胆', '繊細', '強気', '優雅', '知的',
      '謙虚', '誠実', '勇敢', '忠実', '思いやり', '几帳面', '自由', '創造的'
    ];
    
    const tags = [];
    const text = displayUser.selectedCharacter.personalityPrompt;
    
    if (typeof text === 'object') {
      const textStr = text[locale] || text.ja || text.en || '';
      personalityWords.forEach(word => {
        if (textStr.toLowerCase().includes(word.toLowerCase())) {
          tags.push(word);
        }
      });
    } else if (typeof text === 'string') {
      personalityWords.forEach(word => {
        if (text.toLowerCase().includes(word.toLowerCase())) {
          tags.push(word);
        }
      });
    }
    
    return tags.slice(0, 5);
  };
  
  const personalityTags = generatePersonalityTags();
  
  // キャラクター名を取得（オブジェクトの場合はロケールに合わせて表示）
  const getCharacterName = () => {
    const character = displayUser.selectedCharacter;
    if (!character) return '';
    
    if (typeof character.name === 'object') {
      return character.name[locale] || character.name.ja || character.name.en || '';
    }
    return character.name || '';
  };
  
  // キャラクター説明を取得（オブジェクトの場合はロケールに合わせて表示）
  const getCharacterDescription = () => {
    const character = displayUser.selectedCharacter;
    if (!character) return '';
    
    if (typeof character.description === 'object') {
      return character.description[locale] || character.description.ja || character.description.en || '';
    }
    return character.description || '';
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard__main">
        <div className="dashboard__card">
          <div className="dashboard__section-wrapper">
            <div className="dashboard__card--image">
              {displayUser.selectedCharacter?.imageCharacterSelect ? (
                <img
                  src={displayUser.selectedCharacter.imageCharacterSelect}
                  alt={getCharacterName()}
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
                <p className="dashboard__title">{getCharacterName()}</p>
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
                  {displayUser.selectedCharacter?.personalityPrompt || t('no_info', '情報なし')}
                </p>
              </div>
              <div className="dashboard__section">
                <h2 className="dashboard__label">{t('description', '説明')}</h2>
                <p className="dashboard__desc">
                  {getCharacterDescription() || t('no_info', '情報なし')}
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
