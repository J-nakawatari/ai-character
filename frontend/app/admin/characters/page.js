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
    <div>
      <h1 className="admin-dashboard-title">キャラクター管理</h1>
      {error && (
        <div className="admin-stats-card" style={{background:'#fff0f3', color:'#c2185b', marginBottom: '24px'}}>{error}</div>
      )}
      <div className="admin-stats-cards">
        <div className="admin-stats-card">
          <div className="admin-stats-title"><span className="admin-stats-icon">🤖</span>キャラクター数</div>
          <div className="admin-stats-value">{characters.length}</div>
          <div className="admin-stats-desc">登録キャラクター数</div>
        </div>
        <div style={{flex:1}}></div>
      </div>
      <div className="admin-stats-card" style={{padding:'24px 18px', marginBottom:'32px'}}>
        <div className="admin-stats-title"><span className="admin-stats-icon">📋</span>キャラクター一覧</div>
        <div style={{width:'100%', overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f4f6fa'}}>
                <th style={{textAlign:'left', padding:'8px 12px'}}>画像</th>
                <th style={{textAlign:'left', padding:'8px 12px'}}>名前</th>
                <th style={{textAlign:'left', padding:'8px 12px'}}>説明</th>
                <th style={{textAlign:'left', padding:'8px 12px'}}>種別</th>
                <th style={{textAlign:'left', padding:'8px 12px'}}>ステータス</th>
                <th style={{textAlign:'left', padding:'8px 12px'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {characters.length === 0 ? (
                <tr><td colSpan={6} style={{padding:'16px', textAlign:'center'}}>キャラクターが見つかりません</td></tr>
              ) :
                characters.map(character => (
                  <tr key={character._id} style={{borderTop:'1px solid #eee'}}>
                    <td style={{padding:'8px 12px'}}>
                      {character.imageChatAvatar ? (
                        <img src={character.imageChatAvatar} alt={character.name} style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover', background:'#f4f6fa'}} />
                      ) : (
                        <span style={{display:'inline-block', width:'40px', height:'40px', borderRadius:'50%', background:'#f4f6fa', textAlign:'center', lineHeight:'40px', color:'#aaa', fontWeight:'bold'}}>{character.name.charAt(0)}</span>
                      )}
                    </td>
                    <td style={{padding:'8px 12px', fontWeight:'bold'}}>{character.name}</td>
                    <td style={{padding:'8px 12px', maxWidth:'240px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{character.description}</td>
                    <td style={{padding:'8px 12px'}}>
                      {character.isPremium ? <span style={{color:'#fa7be6'}}>プレミアム</span> : <span style={{color:'#888'}}>通常</span>}
                      {character.isLimited && <span style={{color:'#43eafc', marginLeft:'8px'}}>限定</span>}
                    </td>
                    <td style={{padding:'8px 12px'}}>{character.isActive ? <span style={{color:'#43eafc'}}>有効</span> : <span style={{color:'#c2185b'}}>無効</span>}</td>
                    <td style={{padding:'8px 12px'}}>
                      <button onClick={() => setModalCharacter(character)} className="admin-logout-btn" style={{background:'#eee', color:'#7b1fa2', marginRight:'6px'}}>詳細</button>
                      <button onClick={() => handleEditCharacter(character._id)} className="admin-logout-btn" style={{background:'#e0f7fa', color:'#7b1fa2', marginRight:'6px'}}>編集</button>
                      <button onClick={() => handleDeleteCharacter(character._id)} className="admin-logout-btn" style={{background:'#ffb3c6', color:'#c2185b'}}>削除</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      {modalCharacter && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="admin-stats-card" style={{minWidth:'320px',maxWidth:'90vw',padding:'32px 36px',position:'relative'}}>
            <button onClick={()=>setModalCharacter(null)} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',fontSize:'1.5rem',color:'#888',cursor:'pointer'}}>×</button>
            <div style={{display:'flex',alignItems:'center',gap:'18px',marginBottom:'18px'}}>
              {modalCharacter.imageChatAvatar ? (
                <img src={modalCharacter.imageChatAvatar} alt={modalCharacter.name} style={{width:'56px',height:'56px',borderRadius:'50%',objectFit:'cover',background:'#f4f6fa'}} />
              ) : (
                <span style={{display:'inline-block', width:'56px', height:'56px', borderRadius:'50%', background:'#f4f6fa', textAlign:'center', lineHeight:'56px', color:'#aaa', fontWeight:'bold',fontSize:'1.5rem'}}>{modalCharacter.name.charAt(0)}</span>
              )}
              <div>
                <div style={{fontWeight:'bold',fontSize:'1.2rem'}}>{modalCharacter.name}</div>
                <div style={{color:'#888',fontSize:'0.95rem'}}>{modalCharacter.isPremium ? 'プレミアム' : '通常'}{modalCharacter.isLimited && '・限定'}</div>
              </div>
            </div>
            <div style={{marginBottom:'12px'}}><b>説明:</b> {modalCharacter.description}</div>
            <div style={{marginBottom:'12px'}}><b>性格:</b> {modalCharacter.personalityPrompt}</div>
            <div style={{marginBottom:'12px'}}><b>ステータス:</b> {modalCharacter.isActive ? <span style={{color:'#43eafc'}}>有効</span> : <span style={{color:'#c2185b'}}>無効</span>}</div>
          </div>
        </div>
      )}
      <div style={{marginTop:'32px'}}>
        <button onClick={handleCreateCharacter} className="admin-logout-btn" style={{background:'#43eafc', color:'#fff', fontWeight:'bold'}}>新規キャラクター作成</button>
      </div>
    </div>
  );
}
