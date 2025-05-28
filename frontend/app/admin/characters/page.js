'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function AdminCharacters() {
  const { admin } = useAdminAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await api.get('/admin/characters');
        setCharacters(res.data);
        setError('');
      } catch (err) {
        console.error('キャラクター一覧の取得に失敗:', err);
        setError('キャラクター一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    if (admin) {
      fetchCharacters();
    }
  }, [admin]);

  const handleDeleteCharacter = async (characterId) => {
    if (!confirm('本当にこのキャラクターを削除しますか？')) {
      return;
    }
    try {
      await api.delete(`/admin/characters/${characterId}`);
      setCharacters(characters.filter(char => char._id !== characterId));
    } catch (err) {
      console.error('キャラクターの削除に失敗:', err);
      alert('キャラクターの削除に失敗しました');
    }
  };

  const handleEditCharacter = (id) => {
    router.push(`/admin/characters/${id}`);
  };

  if (loading) {
    return <GlobalLoading text="読み込み中..." />;
  }

  if (error) {
    return (
      <div className="admin-content">
        <div className="admin-error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1 className="admin-dashboard-title">キャラクター管理</h1>
          <Button variant="primary" onClick={() => router.push('/admin/characters/new')}>＋ 新規登録</Button>
        </div>
        <div className="admin-content-wrapper">
          <div className="character-list">
            {characters.map(character => (
              <Card key={character._id} className="character-list-item">
                <div className="character-image">
                  {character.imageCharacterSelect ? (
                    <img src={character.imageCharacterSelect} alt="avatar" className="character-avatar" />
                  ) : (
                    <div className="character-placeholder" />
                  )}
                </div>
                <div className="character-info">
                  <div className="character-main-info">
                    <span className="character-name-ja">{character.name?.ja || '(名称未設定)'}</span>
                    <span className="character-name-en">{character.name?.en}</span>
                    {character.isActive ? (
                      <span className="tag tag--active">有効</span>
                    ) : (
                      <span className="tag tag--inactive">無効</span>
                    )}
                    <span className={`tag ${
                      character.characterAccessType === 'free' ? 'tag--free' :
                      character.characterAccessType === 'subscription' ? 'tag--sub' :
                      'tag--paid'
                    }`}>
                      {character.characterAccessType === 'free' ? '無料' :
                       character.characterAccessType === 'subscription' ? 'サブスク' :
                       '買い切り'}
                    </span>
                    <div className="character-details">
                      <div className="character-description">{character.description?.ja}</div>
                      {character.characterAccessType === 'purchaseOnly' && (
                        <span className="character-price">：価格: <b>{character.price}円</b></span>
                      )}
                    </div>
                  </div>
                  <div className="character-additional-info">
                    <span className="character-created-at">作成日: {character.createdAt ? new Date(character.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
                <div className="character-actions">
                  <Button variant="edit" onClick={() => handleEditCharacter(character._id)}>編集</Button>
                  <Button variant="secondary" onClick={() => router.push(`/admin/characters/${character._id}/detail`)}>詳細</Button>
                  <Button variant="danger" onClick={() => handleDeleteCharacter(character._id)}>削除</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 