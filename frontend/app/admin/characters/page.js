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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">キャラクター管理</h1>
        
        <Button onClick={handleCreateCharacter}>
          新規キャラクター作成
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.length === 0 ? (
          <p>キャラクターが見つかりません</p>
        ) : (
          characters.map(character => (
            <Card key={character._id} className="flex flex-col">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  {character.imageChatAvatar ? (
                    <img
                      src={character.imageChatAvatar}
                      alt={character.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      {character.name.charAt(0)}
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-xl font-semibold">{character.name}</h2>
                    <p className="text-sm text-gray-500">
                      {character.isPremium ? 'プレミアム' : '通常'}
                      {character.isLimited ? ' / 限定' : ''}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-3">{character.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm">
                    <span className="font-medium">ステータス:</span> {character.isActive ? '有効' : '無効'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={() => handleEditCharacter(character._id)}
                  className="flex-1"
                >
                  編集
                </Button>
                
                <Button
                  onClick={() => handleDeleteCharacter(character._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  削除
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
