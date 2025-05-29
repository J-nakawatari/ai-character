'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';
import Card from '@/components/Card';
import '../../styles/admin-design-system.css';

export default function AdminUsers() {
  const { admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

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

  const handleShowDetail = async (userId) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setSelectedUser(null);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setDetailError('');
    } catch (err) {
      console.error('ユーザー詳細の取得に失敗:', err);
      setDetailError('ユーザー詳細の取得に失敗しました');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
    setDetailError('');
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

  // ステータスバッジの取得
  const getStatusBadge = (user) => {
    if (!user.isActive) return <span className="admin-badge admin-badge--error">無効</span>;
    if (!user.hasCompletedSetup) return <span className="admin-badge admin-badge--warning">未完了</span>;
    if (user.membershipType === 'subscription' && user.subscriptionStatus === 'active') {
      return <span className="admin-badge admin-badge--success">プレミアム</span>;
    }
    return <span className="admin-badge admin-badge--neutral">無料</span>;
  };

  // 親密度統計の計算
  const getUserAffinityStats = (user) => {
    if (!user.affinities || user.affinities.length === 0) {
      return { average: 0, count: 0, maxLevel: 0 };
    }
    
    const levels = user.affinities.map(a => a.level || 0);
    const average = Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length);
    const maxLevel = Math.max(...levels);
    
    return { average, count: levels.length, maxLevel };
  };

  return (
    <>
    <div className="admin-content">
      <div style={{ marginBottom: 'var(--admin-space-8)' }}>
        <h1 style={{ 
          fontSize: 'var(--admin-font-size-3xl)', 
          fontWeight: '700', 
          color: 'var(--admin-gray-900)', 
          margin: '0 0 var(--admin-space-2) 0' 
        }}>
          ユーザー管理
        </h1>
        <p style={{ 
          fontSize: 'var(--admin-font-size-base)', 
          color: 'var(--admin-gray-600)', 
          margin: 0 
        }}>
          {users.length}名のユーザーを管理中
        </p>
      </div>
      
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-table-title">ユーザー一覧</div>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ユーザー情報</th>
                <th>ステータス</th>
                <th>会員種別</th>
                <th>親密度統計</th>
                <th>最終活動</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const affinityStats = getUserAffinityStats(user);
                return (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)' }}>
                        <div style={{ fontWeight: '600', fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-900)' }}>
                          {user.name?.ja || user.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                          {user.email}
                        </div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                          ID: {user._id.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
                        {getStatusBadge(user)}
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                          {user.preferredLanguage || 'ja'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)' }}>
                        <div style={{ fontSize: 'var(--admin-font-size-sm)', fontWeight: '500' }}>
                          {user.membershipType === 'subscription' ? 'サブスクリプション' : '無料プラン'}
                        </div>
                        {user.membershipType === 'subscription' && (
                          <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                            状態: {user.subscriptionStatus || 'unknown'}
                          </div>
                        )}
                        {user.subscriptionStartDate && (
                          <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                            開始: {new Date(user.subscriptionStartDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)' }}>
                        <div style={{ fontSize: 'var(--admin-font-size-sm)', fontWeight: '600', color: 'var(--admin-primary-600)' }}>
                          平均: {affinityStats.average}
                        </div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                          最高: {affinityStats.maxLevel} | {affinityStats.count}キャラ
                        </div>
                        {affinityStats.count > 0 && (
                          <div className="admin-progress" style={{ marginTop: 'var(--admin-space-1)' }}>
                            <div 
                              className="admin-progress-bar" 
                              style={{ width: `${affinityStats.average}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)' }}>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                          {user.selectedCharacter ? 
                            (user.selectedCharacter.name?.ja || user.selectedCharacter.name || 'Unknown Character') 
                            : '未選択'
                          }
                        </div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-400)' }}>
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '未記録'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)', minWidth: '120px' }}>
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => handleShowDetail(user._id)}
                        >
                          詳細表示
                        </button>
                        <button
                          className="admin-btn admin-btn--error admin-btn--sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    {showDetailModal && (
      <div className="admin-modal-overlay" onClick={closeDetailModal}>
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h2 className="admin-modal-title">
              {selectedUser ? (selectedUser.name?.ja || selectedUser.name || 'Unknown User') : 'ユーザー詳細'}
            </h2>
            <button className="admin-modal-close" onClick={closeDetailModal} aria-label="閉じる">
              ×
            </button>
          </div>
          
          <div className="admin-modal-body">
            {detailLoading ? (
              <div style={{ padding: 'var(--admin-space-6)', textAlign: 'center', color: 'var(--admin-gray-500)' }}>
                読み込み中...
              </div>
            ) : detailError ? (
              <div className="admin-badge admin-badge--error" style={{ margin: 'var(--admin-space-4)' }}>
                {detailError}
              </div>
            ) : selectedUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-6)' }}>
                {/* ユーザー基本情報 */}
                <div className="admin-card">
                  <h3 style={{ margin: '0 0 var(--admin-space-4) 0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                    基本情報
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-4)' }}>
                    <div>
                      <div className="admin-form-label">メールアドレス</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.email}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">ユーザーID</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)', fontFamily: 'monospace' }}>
                        {selectedUser._id}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">ステータス</div>
                      {getStatusBadge(selectedUser)}
                    </div>
                    <div>
                      <div className="admin-form-label">言語設定</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.preferredLanguage || 'ja'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 会員情報 */}
                <div className="admin-card">
                  <h3 style={{ margin: '0 0 var(--admin-space-4) 0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                    会員情報
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-4)' }}>
                    <div>
                      <div className="admin-form-label">会員種別</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.membershipType === 'subscription' ? 'サブスクリプション' : '無料プラン'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">サブスク状態</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.subscriptionStatus || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">開始日</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.subscriptionStartDate ? 
                          new Date(selectedUser.subscriptionStartDate).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">選択キャラクター</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.selectedCharacter ? 
                          (selectedUser.selectedCharacter.name?.ja || selectedUser.selectedCharacter.name || 'Unknown') 
                          : '未選択'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 親密度情報 */}
                {selectedUser.affinities && selectedUser.affinities.length > 0 && (
                  <div className="admin-card">
                    <h3 style={{ margin: '0 0 var(--admin-space-4) 0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                      親密度情報
                    </h3>
                    <div style={{ display: 'grid', gap: 'var(--admin-space-3)' }}>
                      {selectedUser.affinities.map((affinity, idx) => (
                        <div key={idx} style={{ 
                          padding: 'var(--admin-space-3)', 
                          background: 'var(--admin-gray-50)', 
                          borderRadius: 'var(--admin-radius-lg)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 'var(--admin-font-size-sm)', fontWeight: '500' }}>
                              {affinity.character?.name?.ja || affinity.character?.name || 'Unknown Character'}
                            </div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                              最終対話: {affinity.lastInteractedAt ? 
                                new Date(affinity.lastInteractedAt).toLocaleDateString() : 'なし'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontSize: 'var(--admin-font-size-lg)', 
                              fontWeight: '700', 
                              color: 'var(--admin-primary-600)' 
                            }}>
                              Lv.{affinity.level || 0}
                            </div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                              連続: {affinity.lastVisitStreak || 0}日
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 購入キャラクター */}
                {selectedUser.purchasedCharacters && selectedUser.purchasedCharacters.length > 0 && (
                  <div className="admin-card">
                    <h3 style={{ margin: '0 0 var(--admin-space-4) 0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                      購入キャラクター
                    </h3>
                    <div style={{ display: 'grid', gap: 'var(--admin-space-3)' }}>
                      {selectedUser.purchasedCharacters.map((pc, idx) => (
                        <div key={idx} style={{ 
                          padding: 'var(--admin-space-3)', 
                          background: 'var(--admin-gray-50)', 
                          borderRadius: 'var(--admin-radius-lg)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 'var(--admin-font-size-sm)', fontWeight: '500' }}>
                              {pc.character?.name?.ja || pc.character?.name || 'Unknown Character'}
                            </div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                              購入日: {pc.purchaseDate ? 
                                new Date(pc.purchaseDate).toLocaleDateString() : 'なし'}
                            </div>
                          </div>
                          <div className="admin-badge admin-badge--success">
                            {pc.purchaseType}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )}
    </>
  );
} 