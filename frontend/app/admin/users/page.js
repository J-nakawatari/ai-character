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
    <div className="admin-content">
      <h1 className="admin-dashboard-title">ユーザー管理</h1>
      <div className="admin-content-wrapper">
        {error && (
          <div className="admin-stats-card-wrapper error">{error}</div>
        )}
        <div className="admin-stats-card-wrapper">
          <div className="admin-stats-title">ユーザー一覧</div>
          <div className="user-list">
            {users.map(user => (
              <div key={user._id} className="user-list-row">
                <div className="user-list-cell">{user.name || user.email}</div>
                <div className="user-list-cell">
                セットアップ状態：
                  <span className={`status-badge ${user.hasCompletedSetup ? 'status-completed' : 'status-pending'}`}>
                    {user.hasCompletedSetup ? '完了' : '未完了'}
                  </span>
                </div>
                <div className="user-list-cell">登録日：{new Date(user.createdAt).toLocaleString('ja-JP')}</div>
                <div className="user-list-actions">
                  <button onClick={() => handleUserSelect(user._id)} className="admin-logout-btn">詳細</button>
                  <button onClick={() => handleBanUser(user._id)} className="admin-logout-btn ban">無効化</button>
                  <button onClick={() => handleDeleteUser(user._id)} className="admin-logout-btn delete">削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedUser && (
          <div className="admin-stats-card-wrapper">
            <div className="admin-stats-title">ユーザー詳細</div>
            <div className="user-detail-section">
              <h3 className="user-detail-section-title">基本情報</h3>
              <div className="user-detail-grid">
                <div className="user-detail-item">
                  <span className="user-detail-label">名前</span>
                  <span className="user-detail-value">{selectedUser.name}</span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">メール</span>
                  <span className="user-detail-value">{selectedUser.email}</span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">登録日</span>
                  <span className="user-detail-value">{new Date(selectedUser.createdAt).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </div>
            <div className="user-detail-section">
              <h3 className="user-detail-section-title">アカウント情報</h3>
              <div className="user-detail-grid">
                <div className="user-detail-item">
                  <span className="user-detail-label">セットアップ状態</span>
                  <span className={`user-detail-value ${selectedUser.hasCompletedSetup ? 'status-completed' : 'status-pending'}`}>{selectedUser.hasCompletedSetup ? '完了' : '未完了'}</span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">選択中キャラクター</span>
                  <span className="user-detail-value">
                    {selectedUser.selectedCharacter ? (
                      <div className="character-info">
                        <span className="character-name">{selectedUser.selectedCharacter.name}</span>
                      </div>
                    ) : (
                      <span className="status-pending">未選択</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
