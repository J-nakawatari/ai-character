'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../utils/adminAuth';
import api from '../../utils/api';
import Card from '../../components/Card';

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
    return (
      <div className="flex justify-center items-center h-full">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理者ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-2">ユーザー統計</h2>
          <p className="text-3xl font-bold">{stats.userCount}</p>
          <p className="text-gray-500">登録ユーザー数</p>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-2">キャラクター統計</h2>
          <p className="text-3xl font-bold">{stats.characterCount}</p>
          <p className="text-gray-500">登録キャラクター数</p>
        </Card>
      </div>
    </div>
  );
}
