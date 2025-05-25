'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';
import Card from '@/components/Card';

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

  return (
    <>
    <div className="admin-content">
      <div className="admin-header">
        <h1 className="admin-dashboard-title">ユーザー管理</h1>
      </div>
      <div className="admin-content-wrapper">
        <Card className="admin-stats-card-wrapper">
          <div className="admin-stats-title">ユーザー一覧</div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>名前</th>
                  <th>メールアドレス</th>
                  <th>登録状況</th>
                  <th>選択キャラクター</th>
                  <th>会員種別</th>
                  <th>言語</th>
                  <th>サブスク状態</th>
                  <th>サブスク開始</th>
                  <th>サブスク終了</th>
                  <th>購入キャラ</th>
                  <th>最終ログイン</th>
                  <th>作成日</th>
                  <th>有効</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name?.ja || user.name || ''}</td>
                    <td>{user.email}</td>
                    <td>{user.hasCompletedSetup ? '完了' : '未完了'}</td>
                    <td>{user.selectedCharacter ? (user.selectedCharacter.name?.ja || user.selectedCharacter.name || user.selectedCharacter._id) : '未選択'}</td>
                    <td>{user.membershipType === 'subscription' ? 'サブスク' : '無料'}</td>
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
                          className="admin-button"
                          onClick={() => handleShowDetail(user._id)}
                        >
                          詳細
                        </button>
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
        </Card>
      </div>
    </div>
    {showDetailModal && (
      <div className="modal-overlay" style={{zIndex: 2000, background: 'rgba(36,41,51,0.55)'}} onClick={closeDetailModal}>
        <div
          className="modal-content admin-stats-card-wrapper"
          style={{ maxWidth: 700, width: '95%', borderRadius: 18, boxShadow: '0 8px 32px rgba(67,234,252,0.10), 0 4px 16px rgba(35,46,67,0.10)', padding: 32, position: 'relative', background: '#fff', display: 'flex', flexDirection: 'column', gap: 32 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={closeDetailModal} aria-label="閉じる" style={{ position: 'absolute', top: 18, right: 18, fontSize: 28, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', zIndex: 10, borderRadius: '50%', width: 40, height: 40, lineHeight: '40px', textAlign: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='none'}>×</button>
          {detailLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>読み込み中...</div>
          ) : detailError ? (
            <div className="admin-error-message" style={{ margin: '24px' }}>{detailError}</div>
          ) : selectedUser ? (
            <>
              <div style={{marginBottom: 8}}>
                <h2 className="admin-dashboard-title" style={{fontSize: '1.5rem', marginBottom: 4}}>{selectedUser.name?.ja || selectedUser.name || ''}</h2>
                <div style={{color: '#6b7280', fontSize: 15, marginBottom: 12}}>{selectedUser.email}</div>
              </div>
              <div className="admin-stats-card-wrapper" style={{margin:0, boxShadow:'none', padding: '20px 0 0 0', background:'none'}}>
                <div className="admin-stats-title" style={{fontSize: '1.1rem', marginBottom: 18}}>ユーザー情報</div>
                <div className="modal-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div><div className="form-label">ID</div><div className="character-detail-value">{selectedUser._id}</div></div>
                  <div><div className="form-label">登録状況</div><div className="character-detail-value">{selectedUser.hasCompletedSetup ? '完了' : '未完了'}</div></div>
                  <div><div className="form-label">選択キャラクター</div><div className="character-detail-value">{selectedUser.selectedCharacter ? (selectedUser.selectedCharacter.name?.ja || selectedUser.selectedCharacter.name || selectedUser.selectedCharacter._id) : '未選択'}</div></div>
                  <div><div className="form-label">会員種別</div><div className="character-detail-value">{selectedUser.membershipType === 'subscription' ? 'サブスク' : '無料'}</div></div>
                  <div><div className="form-label">言語</div><div className="character-detail-value">{selectedUser.preferredLanguage}</div></div>
                  <div><div className="form-label">サブスク状態</div><div className="character-detail-value">{selectedUser.subscriptionStatus}</div></div>
                  <div><div className="form-label">サブスク開始</div><div className="character-detail-value">{selectedUser.subscriptionStartDate ? new Date(selectedUser.subscriptionStartDate).toLocaleString() : '-'}</div></div>
                  <div><div className="form-label">サブスク終了</div><div className="character-detail-value">{selectedUser.subscriptionEndDate ? new Date(selectedUser.subscriptionEndDate).toLocaleString() : '-'}</div></div>
                  <div><div className="form-label">最終ログイン</div><div className="character-detail-value">{selectedUser.lastLoginDate ? new Date(selectedUser.lastLoginDate).toLocaleString() : '-'}</div></div>
                  <div><div className="form-label">作成日</div><div className="character-detail-value">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</div></div>
                  <div><div className="form-label">有効</div><div className="character-detail-value">{selectedUser.isActive ? '有効' : '無効'}</div></div>
                </div>
              </div>
              <div className="admin-stats-card-wrapper" style={{margin:0, boxShadow:'none', padding: '20px 0 0 0', background:'none'}}>
                <div className="admin-stats-title" style={{fontSize: '1.1rem', marginBottom: 18}}>購入キャラ</div>
                {selectedUser.purchasedCharacters && selectedUser.purchasedCharacters.length > 0 ? (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {selectedUser.purchasedCharacters.map((pc, idx) => (
                      <li key={idx} style={{marginBottom: 8, padding: 8, borderRadius: 8, background: '#f8fafc'}}>
                        <div className="form-label">{pc.character?.name?.ja || pc.character?.name || pc.character || ''}</div>
                        <div className="character-detail-value">{pc.purchaseType} / {pc.purchaseDate ? new Date(pc.purchaseDate).toLocaleString() : ''}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-message">なし</div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    )}
    </>
  );
} 