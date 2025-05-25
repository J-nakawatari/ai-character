'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';

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
      <div className="admin-header">
        <h1 className="admin-dashboard-title">キャラクター管理</h1>
      </div>
      <div className="admin-content-wrapper">
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:24}}>
          <button className="admin-button" style={{fontWeight:'bold'}} onClick={() => router.push('/admin/characters/new')}>＋ 新規登録</button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:24}}>
          {characters.map(character => (
            <Card key={character._id} className="character-list-item" style={{display:'flex',alignItems:'center',gap:24,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderRadius:16,background:'#fff'}}>
              {/* 画像 */}
              <div style={{width:72,height:72,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#f3f4f6',borderRadius:16,overflow:'hidden'}}>
                {character.imageCharacterSelect ? (
                  <img src={character.imageCharacterSelect} alt="avatar" style={{width:72,height:72,objectFit:'cover'}} />
                ) : (
                  <div style={{width:48,height:48,background:'#e5e7eb',borderRadius:12}} />
                )}
              </div>
              {/* メイン情報 */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontWeight:'bold',fontSize:18,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{character.name?.ja || '(名称未設定)'}</span>
                  <span style={{fontSize:13,color:'#64748b'}}>{character.name?.en}</span>
                  {character.isActive ? (
                    <span style={{background:'#22c55e',color:'#fff',borderRadius:8,padding:'2px 10px',fontSize:13,marginLeft:8}}>有効</span>
                  ) : (
                    <span style={{background:'#e11d48',color:'#fff',borderRadius:8,padding:'2px 10px',fontSize:13,marginLeft:8}}>無効</span>
                  )}
                  <span style={{
                    background: 
                      character.characterAccessType === 'free' ? '#3b82f6' : 
                      character.characterAccessType === 'subscription' ? '#a21caf' : 
                      '#eab308',
                    color:'#fff',
                    borderRadius:8,
                    padding:'2px 10px',
                    fontSize:13,
                    marginLeft:8
                  }}>
                    {character.characterAccessType === 'free' ? '無料' :
                     character.characterAccessType === 'subscription' ? 'サブスク' :
                     '買い切り'}
                  </span>
                </div>
                <div style={{color:'#64748b',fontSize:14,marginTop:4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{character.description?.ja}</div>
                <div style={{display:'flex',alignItems:'center',gap:24,marginTop:8}}>
                  {character.characterAccessType === 'purchaseOnly' && (
                    <span style={{fontSize:13}}>価格: <b>{character.price}円</b></span>
                  )}
                  <span style={{fontSize:13}}>作成日: {character.createdAt ? new Date(character.createdAt).toLocaleDateString() : '-'}</span>
                </div>
              </div>
              {/* 操作ボタン */}
              <div style={{display:'flex',flexDirection:'column',gap:8,marginLeft:24}}>
                <button className="admin-button admin-button--edit" onClick={() => handleEditCharacter(character._id)}>編集</button>
                <button className="admin-button" onClick={() => router.push(`/admin/characters/${character._id}/detail`)}>詳細</button>
                <button className="admin-button admin-button--danger" style={{color:'#e11d48'}} onClick={() => handleDeleteCharacter(character._id)}>削除</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 