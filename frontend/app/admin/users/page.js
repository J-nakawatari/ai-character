'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      console.error('ユーザー一覧の取得に失敗:', err);
      setError('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUserSelect = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      console.error('ユーザー詳細の取得に失敗:', err);
    }
  };
  
  const handleBanUser = async (userId) => {
    if (!confirm('このユーザーを無効化しますか？')) return;
    
    try {
      await api.put(`/admin/users/${userId}/ban`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('ユーザーの無効化に失敗:', err);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!confirm('このユーザーを削除しますか？この操作は元に戻せません。')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('ユーザーの削除に失敗:', err);
    }
  };
  
  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#43eafc] to-[#fa7be6] text-transparent bg-clip-text font-['M_PLUS_Rounded_1c']">ユーザー管理</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ユーザー一覧 */}
        <div className="md:col-span-1">
          <Card className="h-full hover:shadow-[0_8px_32px_rgba(67,234,252,0.15)]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">ユーザー一覧</h2>
            
            {users.length === 0 ? (
              <p className="text-gray-700">ユーザーが見つかりません</p>
            ) : (
              <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2 text-gray-600">名前</th>
                      <th className="text-left pb-2 text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-t">
                        <td className="py-2">
                          <button
                            onClick={() => handleUserSelect(user._id)}
                            className="text-[#43eafc] hover:text-[#fa7be6] hover:underline text-left transition-colors"
                          >
                            {user.name || user.email}
                          </button>
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => handleUserSelect(user._id)}
                            className="text-[#43eafc] hover:text-[#fa7be6] hover:underline mr-2 transition-colors"
                          >
                            詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
        
        {/* ユーザー詳細 */}
        <div className="md:col-span-2">
          {selectedUser ? (
            <Card className="hover:shadow-[0_8px_32px_rgba(250,123,230,0.15)]">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">ユーザー詳細</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#43eafc] mb-2">基本情報</h3>
                  <p className="mb-2 text-gray-700"><span className="font-medium">名前:</span> {selectedUser.name}</p>
                  <p className="mb-2 text-gray-700"><span className="font-medium">メール:</span> {selectedUser.email}</p>
                  <p className="mb-2 text-gray-700"><span className="font-medium">登録日:</span> {new Date(selectedUser.createdAt).toLocaleString('ja-JP')}</p>
                  <p className="text-gray-700"><span className="font-medium">セットアップ完了:</span> {selectedUser.hasCompletedSetup ? 'はい' : 'いいえ'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#fa7be6] mb-2">選択中キャラクター</h3>
                  {selectedUser.selectedCharacter ? (
                    <>
                      <p className="mb-2 text-gray-700"><span className="font-medium">名前:</span> {selectedUser.selectedCharacter.name}</p>
                      <p className="text-gray-700"><span className="font-medium">説明:</span> {selectedUser.selectedCharacter.description}</p>
                    </>
                  ) : (
                    <p className="text-gray-700">選択されていません</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleBanUser(selectedUser._id)}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:shadow-[0_6px_24px_0_rgba(250,202,21,0.3)]"
                >
                  無効化
                </Button>
                
                <Button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="bg-gradient-to-r from-red-400 to-red-500 hover:shadow-[0_6px_24px_0_rgba(248,113,113,0.3)]"
                >
                  削除
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="hover:shadow-[0_8px_32px_rgba(250,123,230,0.15)]">
              <p className="text-gray-500 text-center py-8">ユーザーを選択してください</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
