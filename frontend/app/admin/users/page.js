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
      <h1 className="admin-dashboard-title">ユーザー管理</h1>
      {error && (
        <div className="admin-stats-card" style={{background:'#fff0f3', color:'#c2185b', marginBottom: '24px'}}>{error}</div>
      )}
      <div className="admin-stats-cards">
        <div className="admin-stats-card">
          <div className="admin-stats-title"><span className="admin-stats-icon">👥</span>ユーザー数</div>
          <div className="admin-stats-value">{users.length}</div>
          <div className="admin-stats-desc">登録ユーザー数</div>
        </div>
      </div>
      <div className="admin-stats-cards" style={{flexDirection:'column', gap:'18px'}}>
        <div className="admin-stats-card" style={{padding:'24px 18px'}}>
          <div className="admin-stats-title"><span className="admin-stats-icon">📋</span>ユーザー一覧</div>
          <div style={{width:'100%', overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f4f6fa'}}>
                  <th style={{textAlign:'left', padding:'8px 12px'}}>名前</th>
                  <th style={{textAlign:'left', padding:'8px 12px'}}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{borderTop:'1px solid #eee'}}>
                    <td style={{padding:'8px 12px'}}>{user.name || user.email}</td>
                    <td style={{padding:'8px 12px'}}>
                      <button onClick={() => handleUserSelect(user._id)} className="admin-logout-btn" style={{padding:'4px 12px', fontSize:'0.95rem'}}>詳細</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {selectedUser && (
          <div className="admin-stats-card" style={{padding:'24px 18px'}}>
            <div className="admin-stats-title"><span className="admin-stats-icon">👤</span>ユーザー詳細</div>
            <div style={{marginBottom:'8px'}}><b>名前:</b> {selectedUser.name}</div>
            <div style={{marginBottom:'8px'}}><b>メール:</b> {selectedUser.email}</div>
            <div style={{marginBottom:'8px'}}><b>登録日:</b> {new Date(selectedUser.createdAt).toLocaleString('ja-JP')}</div>
            <div style={{marginBottom:'8px'}}><b>セットアップ完了:</b> {selectedUser.hasCompletedSetup ? 'はい' : 'いいえ'}</div>
            <div style={{marginBottom:'8px'}}><b>選択中キャラクター:</b> {selectedUser.selectedCharacter ? selectedUser.selectedCharacter.name : '未選択'}</div>
            <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
              <button onClick={() => handleBanUser(selectedUser._id)} className="admin-logout-btn" style={{background:'#ffe082', color:'#7b1fa2'}}>無効化</button>
              <button onClick={() => handleDeleteUser(selectedUser._id)} className="admin-logout-btn" style={{background:'#ffb3c6', color:'#c2185b'}}>削除</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
