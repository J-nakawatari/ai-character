'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';

export default function AdminUsers() {
  const { admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
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
    if (admin) {
      fetchUsers();
    }
  }, [admin]);

  const handleDeleteUser = async (userId) => {
    if (!confirm('本当にこのユーザーを削除しますか？')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('ユーザーの削除に失敗:', err);
      alert('ユーザーの削除に失敗しました');
    }
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
        <h1 className="admin-dashboard-title">ユーザー管理</h1>
      </div>
      <div className="admin-content-wrapper">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名前</th>
                <th>メールアドレス</th>
                <th>登録日</th>
                <th>最終ログイン</th>
                <th>会員種別</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td class="ID">{user._id}</td>
                  <td>{user.name?.ja || user.name || ''}</td>
                  <td>{user.email}</td>
                  <td>{user.hasCompletedSetup ? '完了' : '未完了'}</td>
                  <td>{user.selectedCharacter ? (user.selectedCharacter.name?.ja || user.selectedCharacter.name || user.selectedCharacter._id) : '未選択'}</td>
                  <td>{user.membershipType === 'premium' ? 'プレミアム' : '無料'}</td>
                  <td>{user.preferredLanguage}</td>
                  <td>{user.subscriptionStatus}</td>
                  <td>{user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleString() : '-'}</td>
                  <td>{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleString() : '-'}</td>
                  <td>
                    {user.purchasedCharacters && user.purchasedCharacters.length > 0 ? (
                      <ul style={{margin:0,padding:0,listStyle:'none'}}>
                        {user.purchasedCharacters.map((pc, idx) => (
                          <li key={idx}>
                            {pc.character?.name?.ja || pc.character?.name || pc.character || ''}（{pc.purchaseType}）
                            <br />{pc.purchaseDate ? new Date(pc.purchaseDate).toLocaleString() : ''}
                          </li>
                        ))}
                      </ul>
                    ) : 'なし'}
                  </td>
                  <td>{user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : '-'}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td>
                  <td>{user.isActive ? '有効' : '無効'}</td>
                  <td>
                    <div className="admin-button-group">
                      <button
                        className="admin-button admin-button--danger"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        削除
                      </button>
                      {user.isActive && (
                        <button
                          className="admin-button admin-button--ban"
                          onClick={() => handleBanUser(user._id)}
                        >
                          BAN
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 