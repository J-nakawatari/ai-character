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
      <div className="modal-overlay" onClick={closeDetailModal}>
        <div
          className="modal-content"
          style={{ maxWidth: '800px', width: '90%' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={closeDetailModal} aria-label="閉じる">×</button>
          {detailLoading ? (
            <div style={{ padding: '24px' }}>読み込み中...</div>
          ) : detailError ? (
            <div className="admin-error-message" style={{ margin: '24px' }}>{detailError}</div>
          ) : selectedUser ? (
            <>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">{selectedUser.name?.ja || selectedUser.name || ''}</h2>
                  <div className="modal-subtitle">{selectedUser.email}</div>
                </div>
              </div>
              <div className="modal-detail-section">
                <h3 className="modal-detail-title">ユーザー情報</h3>
                <div
                  className="modal-detail-grid"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                >
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">ID</div>
                    <div className="modal-detail-value">{selectedUser._id}</div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">登録状況</div>
                    <div className="modal-detail-value">
                      {selectedUser.hasCompletedSetup ? '完了' : '未完了'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">選択キャラクター</div>
                    <div className="modal-detail-value">
                      {selectedUser.selectedCharacter
                        ? selectedUser.selectedCharacter.name?.ja ||
                          selectedUser.selectedCharacter.name ||
                          selectedUser.selectedCharacter._id
                        : '未選択'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">会員種別</div>
                    <div className="modal-detail-value">
                      {selectedUser.membershipType === 'premium' ? 'プレミアム' : '無料'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">言語</div>
                    <div className="modal-detail-value">{selectedUser.preferredLanguage}</div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">サブスク状態</div>
                    <div className="modal-detail-value">{selectedUser.subscriptionStatus}</div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">サブスク開始</div>
                    <div className="modal-detail-value">
                      {selectedUser.subscriptionStartDate
                        ? new Date(selectedUser.subscriptionStartDate).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">サブスク終了</div>
                    <div className="modal-detail-value">
                      {selectedUser.subscriptionEndDate
                        ? new Date(selectedUser.subscriptionEndDate).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">最終ログイン</div>
                    <div className="modal-detail-value">
                      {selectedUser.lastLoginDate
                        ? new Date(selectedUser.lastLoginDate).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">作成日</div>
                    <div className="modal-detail-value">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                  <div className="modal-detail-item">
                    <div className="modal-detail-label">有効</div>
                    <div className="modal-detail-value">
                      {selectedUser.isActive ? '有効' : '無効'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-detail-section">
                <h3 className="modal-detail-title">購入キャラ</h3>
                {selectedUser.purchasedCharacters && selectedUser.purchasedCharacters.length > 0 ? (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {selectedUser.purchasedCharacters.map((pc, idx) => (
                      <li key={idx} className="modal-detail-item">
                        <div className="modal-detail-label">
                          {pc.character?.name?.ja || pc.character?.name || pc.character || ''}
                        </div>
                        <div className="modal-detail-value">
                          {pc.purchaseType} /
                          {pc.purchaseDate ? new Date(pc.purchaseDate).toLocaleString() : ''}
                        </div>
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