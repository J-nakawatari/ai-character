'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import Cookies from 'js-cookie';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
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
      const token = Cookies.get('token');
      await api.put(`/admin/users/${userId}/ban`, { token });
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      setToast({ show: true, message: 'ユーザーを無効化しました', type: 'success' });
    } catch (err) {
      console.error('ユーザーの無効化に失敗:', err);
      setToast({ show: true, message: 'ユーザーの無効化に失敗しました', type: 'error' });
    }
  };
  
  const handleActivateUser = async (userId) => {
    if (!confirm('このユーザーを有効化しますか？')) return;
    try {
      await api.put(`/admin/users/${userId}/activate`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      setToast({ show: true, message: 'ユーザーを有効化しました', type: 'success' });
    } catch (err) {
      console.error('ユーザーの有効化に失敗:', err);
      setToast({ show: true, message: 'ユーザーの有効化に失敗しました', type: 'error' });
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
                  <button onClick={() => handleUserSelect(user._id)} className="admin-logout-btn detail">詳細</button>
                  {user.isActive ? (
                    <button onClick={() => handleBanUser(user._id)} className="admin-logout-btn ban">無効化</button>
                  ) : (
                    <button onClick={() => handleActivateUser(user._id)} className="admin-logout-btn create">有効化</button>
                  )}
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
                  <span className="user-detail-label">会員種別</span>
                  <span className={`user-detail-value ${selectedUser.membershipType === 'premium' ? 'premium-badge' : 'free-badge'}`}>
                    {selectedUser.membershipType === 'premium' ? 'プレミアム会員' : '無料会員'}
                  </span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">サブスクリプション状態</span>
                  <span className={`user-detail-value ${
                    selectedUser.subscriptionStatus === 'active' ? 'active-badge' :
                    selectedUser.subscriptionStatus === 'inactive' ? 'inactive-badge' :
                    selectedUser.subscriptionStatus === 'expired' ? 'expired-badge' :
                    selectedUser.subscriptionStatus === 'canceled' ? 'canceled-badge' : ''
                  }`}>
                    {selectedUser.subscriptionStatus === 'active' ? '有効' :
                     selectedUser.subscriptionStatus === 'inactive' ? '停止中' :
                     selectedUser.subscriptionStatus === 'expired' ? '期限切れ' :
                     selectedUser.subscriptionStatus === 'canceled' ? 'キャンセル済み' : '無料会員'}
                  </span>
                </div>
                {selectedUser.membershipType === 'premium' && selectedUser.subscriptionEndDate && (
                  <div className="user-detail-item">
                    <span className="user-detail-label">次回請求日 / 有効期限</span>
                    <span className="user-detail-value">{new Date(selectedUser.subscriptionEndDate).toLocaleString('ja-JP')}</span>
                  </div>
                )}
                <div className="user-detail-item">
                  <span className="user-detail-label">選択中キャラクター</span>
                  <span className="user-detail-value">
                    {selectedUser.selectedCharacter ? (
                      <div className="modal-header" style={{gap: '16px', alignItems: 'center', margin: 0, padding: 0}}>
                        {selectedUser.selectedCharacter.imageChatAvatar ? (
                          <img
                            src={selectedUser.selectedCharacter.imageChatAvatar}
                            alt={typeof selectedUser.selectedCharacter.name === 'object' ? (selectedUser.selectedCharacter.name.ja || selectedUser.selectedCharacter.name.en || '') : selectedUser.selectedCharacter.name}
                            className="modal-avatar"
                            style={{width: '48px', height: '48px'}}
                          />
                        ) : (
                          <span className="modal-avatar-placeholder" style={{width: '48px', height: '48px', fontSize: '20px'}}>
                            {typeof selectedUser.selectedCharacter.name === 'object'
                              ? (selectedUser.selectedCharacter.name.ja || selectedUser.selectedCharacter.name.en || '')
                              : selectedUser.selectedCharacter.name}
                          </span>
                        )}
                        <div className="character-modal-info" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          <div className="modal-title" style={{fontSize: '16px', marginBottom: '2px'}}>{
                            typeof selectedUser.selectedCharacter.name === 'object'
                              ? (selectedUser.selectedCharacter.name.ja || selectedUser.selectedCharacter.name.en || '')
                              : selectedUser.selectedCharacter.name
                          }</div>
                          <div className="modal-subtitle" style={{fontSize: '12px'}}>
                            {selectedUser.selectedCharacter.characterType === 'free' && <span className="free-badge">無料キャラ</span>}
                            {selectedUser.selectedCharacter.characterType === 'premium' && <span className="premium-badge">サブスク会員用キャラクター</span>}
                            {selectedUser.selectedCharacter.characterType === 'paid' && <span className="paid-badge">課金キャラクター：{selectedUser.selectedCharacter.price}円（{selectedUser.selectedCharacter.purchaseType === 'buy' ? '買い切り' : '月額課金'}）</span>}
                            {selectedUser.selectedCharacter.characterType === 'limited' && <span className="limited-badge">期間限定キャラクター</span>}
                          </div>
                          <div className="character-date" style={{fontSize: '12px', color: '#6B7A99'}}>
                            登録日時: {selectedUser.selectedCharacter.createdAt ? new Date(selectedUser.selectedCharacter.createdAt).toLocaleString('ja-JP') : ''}
                          </div>
                        </div>
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
        {toast.show && (
          <Toast
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
}
