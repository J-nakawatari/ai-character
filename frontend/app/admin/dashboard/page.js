'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import Card from '@/components/Card';
import GlobalLoading from '@/components/GlobalLoading';

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    characterCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await api.get('/admin/users');
        const charactersRes = await api.get('/admin/characters');
        setStats({
          userCount: usersRes.data.length,
          characterCount: charactersRes.data.length
        });
      } catch (err) {
        console.error('統計データの取得に失敗:', err);
      } finally {
        setLoading(false);
      }
    };
    if (admin) {
      fetchStats();
    }
  }, [admin]);

  if (loading) {
    return <GlobalLoading text="読み込み中..." />;
  }

  return (
    <div className="admin-content">
      <h1 className="admin-dashboard-title">管理者ダッシュボード</h1>
      <div className="admin-content-wrapper">
        <div className="admin-stats-cards">
          <div className="admin-stats-card">
            <div className="admin-stats-info">
              <div className="admin-stats-title">ユーザー統計</div>
              <div className="admin-stats-value">{stats.userCount}</div>
              <div className="admin-stats-desc">登録ユーザー数</div>
            </div>
          </div>
          <div className="admin-stats-card">
            <div className="admin-stats-info">
              <div className="admin-stats-title">キャラクター統計</div>
              <div className="admin-stats-value">{stats.characterCount}</div>
              <div className="admin-stats-desc">登録キャラクター数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 