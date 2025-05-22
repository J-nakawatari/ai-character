'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AdminCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalCharacter, setModalCharacter] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    fetchCharacters();
  }, []);
  
  const fetchCharacters = async () => {
    try {
      setLoading(true);
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
  
  const handleCreateCharacter = () => {
    router.push('/admin/characters/new');
  };
  
  const handleEditCharacter = (id) => {
    router.push(`/admin/characters/${id}/edit`);
  };
  
  const handleDeleteCharacter = async (id) => {
    if (!confirm('このキャラクターを削除しますか？この操作は元に戻せません。')) return;
    
    try {
      await api.delete(`/admin/characters/${id}`);
      fetchCharacters();
    } catch (err) {
      console.error('キャラクターの削除に失敗:', err);
    }
  };
  
  if (loading && characters.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-content">
      <h1 className="admin-dashboard-title">キャラクター管理</h1>
      <div className="admin-content-wrapper">
        {error && (
          <div className="admin-stats-card-wrapper error">{error}</div>
        )}
        <div className="admin-stats-cards">
          <div className="character-admin-stats-card">
            <div className="admin-stats-info">
              <div className="admin-stats-title">
              登録キャラクター数 {characters.length}人
              </div>
              <div className="admin-stats-summary">
                <div className="admin-stats-summary-item">
                  <span className="admin-stats-summary-label">プレミアム</span>
                  <span className="admin-stats-summary-value">{characters.filter(c => c.isPremium).length}人</span>
                </div>
                <div className="admin-stats-summary-item">
                  <span className="admin-stats-summary-label">限定</span>
                  <span className="admin-stats-summary-value">{characters.filter(c => c.isLimited).length}人</span>
                </div>
                <div className="admin-stats-summary-item">
                  <span className="admin-stats-summary-label">有効</span>
                  <span className="admin-stats-summary-value">{characters.filter(c => c.isActive).length}人</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-spacer"></div>
        </div>
        
        <div className="admin-stats-card-wrapper">
          <div className="admin-stats-header">
            <div className="admin-stats-title">キャラクター一覧</div>
            <button onClick={handleCreateCharacter} className="admin-logout-btn create">新規作成</button>
          </div>
          <div className="character-list">
            {characters.length === 0 ? (
              <div className="empty-message">キャラクターが見つかりません</div>
            ) : (
              characters.map(character => (
                <div key={character._id} className="character-list-item">
                  <div className="character-list-main">
                    <div className="character-avatar">
                      {character.imageChatAvatar ? (
                        <img src={character.imageChatAvatar} alt={character.name} className="character-avatar-img" />
                      ) : (
                        <span className="character-avatar-placeholder">{character.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="character-info">
                      <div className="character-name">{typeof character.name === 'object' ? (character.name.ja || character.name.en || '') : character.name}</div>
                      <div className="character-date">
                        登録日時: {new Date(character.createdAt).toLocaleString('ja-JP')}
                      </div>
                      <div className="character-tags">
                        {character.isPremium && (
                          <span className="premium-badge">
                            プレミアム：{character.purchaseType === 'buy' ? '買い切り' : 'レンタル'}
                          </span>
                        )}
                        {character.isLimited && <span className="limited-badge">限定</span>}
                        {character.isActive ? (
                          <span className="active-badge">有効</span>
                        ) : (
                          <span className="inactive-badge">無効</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="character-actions">
                    <button onClick={() => setModalCharacter(character)} className="admin-logout-btn detail">詳細</button>
                    <button onClick={() => handleEditCharacter(character._id)} className="admin-logout-btn edit">編集</button>
                    <button onClick={() => handleDeleteCharacter(character._id)} className="admin-logout-btn delete">削除</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {modalCharacter && (
          <div className="modal-overlay">
            <div className="admin-stats-card-wrapper modal-content">
              <button onClick={()=>setModalCharacter(null)} className="modal-close">×</button>
              <div className="modal-header">
                {modalCharacter.imageChatAvatar ? (
                  <img src={modalCharacter.imageChatAvatar} alt={modalCharacter.name} className="modal-avatar" />
                ) : (
                  <span className="modal-avatar-placeholder">{modalCharacter.name.charAt(0)}</span>
                )}
                <div>
                  <div className="modal-title">{typeof modalCharacter.name === 'object' ? (modalCharacter.name.ja || modalCharacter.name.en || '') : modalCharacter.name}</div>
                  <div className="modal-subtitle">
                    {modalCharacter.isPremium ? 'プレミアム' : '通常'}{modalCharacter.isLimited && '・限定'}
                  </div>
                </div>
              </div>
              <div className="modal-detail-section">
                <h3 className="modal-detail-title">基本情報</h3>
                <div className="modal-detail-grid">
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">特長</span>
                    <span className="modal-detail-value">{typeof modalCharacter.description === 'object' ? (modalCharacter.description.ja || modalCharacter.description.en || '') : modalCharacter.description}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">性格</span>
                    <span className="modal-detail-value">{typeof modalCharacter.personalityPrompt === 'object' ? (modalCharacter.personalityPrompt.ja || modalCharacter.personalityPrompt.en || '') : modalCharacter.personalityPrompt}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">ステータス</span>
                    <span className="modal-detail-value">
                      {modalCharacter.isActive ? (
                        <span className="active-badge">有効</span>
                      ) : (
                        <span className="inactive-badge">無効</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
