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

  // アカウント状態バッジの取得
  const getStatusBadge = (user) => {
    if (!user.isActive) return <span className="admin-badge admin-badge--error">❌ 無効</span>;
    if (!user.hasCompletedSetup) return <span className="admin-badge admin-badge--warning">⚠️ セットアップ未完了</span>;
    return <span className="admin-badge admin-badge--success">✅ 有効</span>;
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
          <table className="admin-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>ユーザー情報</th>
                <th>アカウント状態</th>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
                        <span className={`admin-badge ${user.membershipType === 'subscription' ? 'admin-badge--warning' : 'admin-badge--neutral'}`}>
                          {user.membershipType === 'subscription' ? '🔥 プレミアム' : '🆓 無料'}
                        </span>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)' }}>
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => handleShowDetail(user._id)}
                          style={{ fontSize: 'var(--admin-font-size-xs)', padding: '4px 8px' }}
                        >
                          詳細
                        </button>
                        <button
                          className="admin-btn admin-btn--error admin-btn--sm"
                          onClick={() => handleDeleteUser(user._id)}
                          style={{ fontSize: 'var(--admin-font-size-xs)', padding: '4px 8px' }}
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
                {/* アカウント情報 */}
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                    <h3 style={{ margin: '0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                      アカウント情報
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                    <div>
                      <div className="admin-form-label">ユーザー名</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)', fontWeight: '500' }}>
                        {selectedUser.name?.ja || selectedUser.name || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">メールアドレス</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.email}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">ユーザーID</div>
                      <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-600)', fontFamily: 'monospace', background: 'var(--admin-gray-50)', padding: '4px 8px', borderRadius: '4px' }}>
                        {selectedUser._id}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">アカウント状態</div>
                      <div style={{ display: 'flex', gap: 'var(--admin-space-2)', alignItems: 'center' }}>
                        {getStatusBadge(selectedUser)}
                        <span style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-500)' }}>
                          {selectedUser.isActive ? '有効' : '無効'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">作成日</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">最終ログイン</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.lastLoginDate ? new Date(selectedUser.lastLoginDate).toLocaleDateString('ja-JP', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : '未記録'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* サブスクリプション情報 */}
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
                    <span style={{ fontSize: '1.5rem' }}>💳</span>
                    <h3 style={{ margin: '0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                      サブスクリプション情報
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                    <div>
                      <div className="admin-form-label">会員種別</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
                        <span className={`admin-badge ${selectedUser.membershipType === 'subscription' ? 'admin-badge--warning' : 'admin-badge--neutral'}`}>
                          {selectedUser.membershipType === 'subscription' ? '🔥 プレミアム' : '🆓 無料'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">サブスク状態</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
                        <span className={`admin-badge ${
                          selectedUser.subscriptionStatus === 'active' ? 'admin-badge--success' :
                          selectedUser.subscriptionStatus === 'expired' ? 'admin-badge--error' :
                          selectedUser.subscriptionStatus === 'canceled' ? 'admin-badge--warning' :
                          'admin-badge--neutral'
                        }`}>
                          {selectedUser.subscriptionStatus === 'active' ? '✅ 有効' :
                           selectedUser.subscriptionStatus === 'expired' ? '⏰ 期限切れ' :
                           selectedUser.subscriptionStatus === 'canceled' ? '❌ キャンセル済み' :
                           '⚪ 無効'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">開始日</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.subscriptionStartDate ? 
                          new Date(selectedUser.subscriptionStartDate).toLocaleDateString('ja-JP', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          }) : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">終了日</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                        {selectedUser.subscriptionEndDate ? 
                          new Date(selectedUser.subscriptionEndDate).toLocaleDateString('ja-JP', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          }) : '-'}
                      </div>
                    </div>
                    {selectedUser.stripeCustomerId && (
                      <div>
                        <div className="admin-form-label">Stripe顧客ID</div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-600)', fontFamily: 'monospace', background: 'var(--admin-gray-50)', padding: '4px 8px', borderRadius: '4px' }}>
                          {selectedUser.stripeCustomerId}
                        </div>
                      </div>
                    )}
                    {selectedUser.stripeSubscriptionId && (
                      <div>
                        <div className="admin-form-label">SubscriptionID</div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-600)', fontFamily: 'monospace', background: 'var(--admin-gray-50)', padding: '4px 8px', borderRadius: '4px' }}>
                          {selectedUser.stripeSubscriptionId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* キャラクター選択情報 */}
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎭</span>
                    <h3 style={{ margin: '0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                      キャラクター選択
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--admin-space-4)' }}>
                    <div>
                      <div className="admin-form-label">現在選択中</div>
                      <div style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)', fontWeight: '500' }}>
                        {selectedUser.selectedCharacter ? 
                          (selectedUser.selectedCharacter.name?.ja || selectedUser.selectedCharacter.name || 'Unknown') 
                          : '未選択'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">言語設定</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
                        <span>{selectedUser.preferredLanguage === 'en' ? '🇺🇸' : '🇯🇵'}</span>
                        <span style={{ fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-gray-700)' }}>
                          {selectedUser.preferredLanguage === 'en' ? 'English' : '日本語'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="admin-form-label">セットアップ状況</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
                        <span className={`admin-badge ${selectedUser.hasCompletedSetup ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                          {selectedUser.hasCompletedSetup ? '✅ 完了' : '⚠️ 未完了'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 親密度情報 */}
                {selectedUser.affinities && selectedUser.affinities.length > 0 && (
                  <div className="admin-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
                      <span style={{ fontSize: '1.5rem' }}>💕</span>
                      <h3 style={{ margin: '0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                        親密度情報
                      </h3>
                      <span className="admin-badge admin-badge--info" style={{ marginLeft: 'auto' }}>
                        {selectedUser.affinities.length}体のキャラクター
                      </span>
                    </div>
                    <div style={{ display: 'grid', gap: 'var(--admin-space-3)' }}>
                      {selectedUser.affinities.map((affinity, idx) => (
                        <div key={idx} style={{ 
                          padding: 'var(--admin-space-4)', 
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                          borderRadius: 'var(--admin-radius-lg)',
                          border: '1px solid var(--admin-gray-200)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: 'var(--admin-font-size-base)', 
                              fontWeight: '600',
                              color: 'var(--admin-gray-900)',
                              marginBottom: 'var(--admin-space-2)' 
                            }}>
                              {affinity.character?.name?.ja || affinity.character?.name || 'Unknown Character'}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--admin-space-4)', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-600)' }}>
                                📅 最終対話: {affinity.lastInteractedAt ? 
                                  new Date(affinity.lastInteractedAt).toLocaleDateString('ja-JP', {
                                    month: 'short', day: 'numeric'
                                  }) : 'なし'}
                              </div>
                              <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-600)' }}>
                                🔥 連続: {affinity.lastVisitStreak || 0}日
                              </div>
                              {affinity.decayStartAt && (
                                <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-warning-600)' }}>
                                  ⏳ 減衰開始: {new Date(affinity.decayStartAt).toLocaleDateString('ja-JP', {
                                    month: 'short', day: 'numeric'
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', marginLeft: 'var(--admin-space-4)' }}>
                            <div style={{ 
                              fontSize: '1.75rem', 
                              fontWeight: '900', 
                              background: `linear-gradient(135deg, ${
                                affinity.level >= 80 ? '#ef4444, #dc2626' :
                                affinity.level >= 60 ? '#f59e0b, #d97706' :
                                affinity.level >= 40 ? '#3b82f6, #1d4ed8' :
                                affinity.level >= 20 ? '#10b981, #059669' :
                                '#6b7280, #4b5563'
                              })`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              marginBottom: '2px'
                            }}>
                              Lv.{affinity.level || 0}
                            </div>
                            <div style={{ 
                              width: '60px', 
                              height: '6px', 
                              background: 'var(--admin-gray-200)', 
                              borderRadius: '3px',
                              overflow: 'hidden',
                              margin: '0 auto'
                            }}>
                              <div style={{ 
                                width: `${affinity.level || 0}%`, 
                                height: '100%',
                                background: `linear-gradient(90deg, ${
                                  affinity.level >= 80 ? '#ef4444, #dc2626' :
                                  affinity.level >= 60 ? '#f59e0b, #d97706' :
                                  affinity.level >= 40 ? '#3b82f6, #1d4ed8' :
                                  affinity.level >= 20 ? '#10b981, #059669' :
                                  '#6b7280, #4b5563'
                                })`,
                                borderRadius: '3px',
                                transition: 'width 0.3s ease'
                              }}></div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
                      <span style={{ fontSize: '1.5rem' }}>🛒</span>
                      <h3 style={{ margin: '0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                        購入キャラクター
                      </h3>
                      <span className="admin-badge admin-badge--success" style={{ marginLeft: 'auto' }}>
                        {selectedUser.purchasedCharacters.length}体購入済み
                      </span>
                    </div>
                    <div style={{ display: 'grid', gap: 'var(--admin-space-3)' }}>
                      {selectedUser.purchasedCharacters.map((pc, idx) => (
                        <div key={idx} style={{ 
                          padding: 'var(--admin-space-4)', 
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', 
                          borderRadius: 'var(--admin-radius-lg)',
                          border: '1px solid var(--admin-green-200)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: 'var(--admin-font-size-base)', 
                              fontWeight: '600',
                              color: 'var(--admin-gray-900)',
                              marginBottom: 'var(--admin-space-1)' 
                            }}>
                              {pc.character?.name?.ja || pc.character?.name || 'Unknown Character'}
                            </div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-gray-600)' }}>
                              💳 購入日: {pc.purchaseDate ? 
                                new Date(pc.purchaseDate).toLocaleDateString('ja-JP', {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                }) : 'なし'}
                            </div>
                          </div>
                          <div>
                            <span className={`admin-badge ${
                              pc.purchaseType === 'subscription' ? 'admin-badge--warning' : 'admin-badge--success'
                            }`}>
                              {pc.purchaseType === 'subscription' ? '🔄 サブスク' : '💎 買い切り'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* アドオンサブスクリプション */}
                {selectedUser.addOnSubscriptions && selectedUser.addOnSubscriptions.length > 0 && (
                  <div className="admin-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
                      <span style={{ fontSize: '1.5rem' }}>⚡</span>
                      <h3 style={{ margin: '0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
                        アドオンサブスクリプション
                      </h3>
                      <span className="admin-badge admin-badge--info" style={{ marginLeft: 'auto' }}>
                        {selectedUser.addOnSubscriptions.length}件
                      </span>
                    </div>
                    <div style={{ display: 'grid', gap: 'var(--admin-space-3)' }}>
                      {selectedUser.addOnSubscriptions.map((addon, idx) => (
                        <div key={idx} style={{ 
                          padding: 'var(--admin-space-3)', 
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                          borderRadius: 'var(--admin-radius-lg)',
                          border: '1px solid var(--admin-blue-200)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--admin-space-3)'
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>⚡</span>
                          <div style={{ fontSize: 'var(--admin-font-size-sm)', fontWeight: '500' }}>
                            アドオンID: {addon._id || addon}
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