'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';
import '../../../styles/admin-design-system.css';

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    characterCount: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalChats: 0,
    todayChats: 0,
    avgAffinity: 0,
    topCharacter: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, charactersRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/characters')
        ]);
        
        const users = usersRes.data;
        const characters = charactersRes.data;
        
        // ユーザー統計の計算
        const activeUsers = users.filter(user => user.isActive).length;
        const premiumUsers = users.filter(user => 
          user.membershipType === 'subscription' && user.subscriptionStatus === 'active'
        ).length;
        
        // 親密度統計の計算
        let totalAffinityLevels = 0;
        let affinityCount = 0;
        
        users.forEach(user => {
          if (user.affinities && user.affinities.length > 0) {
            user.affinities.forEach(affinity => {
              totalAffinityLevels += affinity.level || 0;
              affinityCount++;
            });
          }
        });
        
        const avgAffinity = affinityCount > 0 ? Math.round(totalAffinityLevels / affinityCount) : 0;
        
        // 人気キャラクター統計
        const characterPopularity = {};
        users.forEach(user => {
          if (user.selectedCharacter && user.selectedCharacter._id) {
            const charId = user.selectedCharacter._id;
            characterPopularity[charId] = (characterPopularity[charId] || 0) + 1;
          }
        });
        
        const topCharacterId = Object.keys(characterPopularity).reduce((a, b) => 
          characterPopularity[a] > characterPopularity[b] ? a : b, null
        );
        
        const topCharacter = topCharacterId ? 
          characters.find(char => char._id === topCharacterId) : null;

        setStats({
          userCount: users.length,
          characterCount: characters.length,
          activeUsers,
          premiumUsers,
          totalChats: Math.floor(Math.random() * 10000) + 5000, // ダミーデータ
          todayChats: Math.floor(Math.random() * 500) + 100, // ダミーデータ
          avgAffinity,
          topCharacter
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
      <div style={{ marginBottom: 'var(--admin-space-8)' }}>
        <h1 style={{ 
          fontSize: 'var(--admin-font-size-3xl)', 
          fontWeight: '700', 
          color: 'var(--admin-gray-900)', 
          margin: '0 0 var(--admin-space-2) 0' 
        }}>
          管理者ダッシュボード
        </h1>
        <p style={{ 
          fontSize: 'var(--admin-font-size-base)', 
          color: 'var(--admin-gray-600)', 
          margin: 0 
        }}>
          システム全体の統計情報とトレンドを確認できます
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: 'var(--admin-space-8)' }}>
        {/* 総ユーザー数 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--primary">
            👥
          </div>
          <div className="admin-stats-value">{stats.userCount.toLocaleString()}</div>
          <div className="admin-stats-label">総ユーザー数</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +12.5%
          </div>
        </div>

        {/* アクティブユーザー */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--success">
            ✨
          </div>
          <div className="admin-stats-value">{stats.activeUsers.toLocaleString()}</div>
          <div className="admin-stats-label">アクティブユーザー</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +8.2%
          </div>
        </div>

        {/* プレミアムユーザー */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--warning">
            💎
          </div>
          <div className="admin-stats-value">{stats.premiumUsers.toLocaleString()}</div>
          <div className="admin-stats-label">プレミアムユーザー</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +15.7%
          </div>
        </div>

        {/* キャラクター数 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--secondary">
            🤖
          </div>
          <div className="admin-stats-value">{stats.characterCount.toLocaleString()}</div>
          <div className="admin-stats-label">AIキャラクター数</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +2.1%
          </div>
        </div>

        {/* 総チャット数 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--primary">
            💬
          </div>
          <div className="admin-stats-value">{stats.totalChats.toLocaleString()}</div>
          <div className="admin-stats-label">総チャット数</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +24.3%
          </div>
        </div>

        {/* 今日のチャット */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--success">
            📈
          </div>
          <div className="admin-stats-value">{stats.todayChats.toLocaleString()}</div>
          <div className="admin-stats-label">今日のチャット数</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +18.9%
          </div>
        </div>

        {/* 平均親密度 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--primary">
            💖
          </div>
          <div className="admin-stats-value">{stats.avgAffinity}</div>
          <div className="admin-stats-label">平均親密度レベル</div>
          <div className="admin-stats-change admin-stats-change--positive">
            ↗ +5.4%
          </div>
        </div>

        {/* 人気キャラクター */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--warning">
            🌟
          </div>
          <div className="admin-stats-value" style={{ fontSize: 'var(--admin-font-size-lg)' }}>
            {stats.topCharacter ? (stats.topCharacter.name?.ja || stats.topCharacter.name || 'Unknown') : 'N/A'}
          </div>
          <div className="admin-stats-label">人気No.1キャラクター</div>
          <div className="admin-stats-change admin-stats-change--positive">
            🔥 トレンド
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--admin-space-6)' }}>
        {/* ユーザー成長チャート（ダミー） */}
        <div className="admin-chart-container">
          <div className="admin-chart-header">
            <div className="admin-chart-title">ユーザー登録推移</div>
            <div className="admin-badge admin-badge--success">+24% 今月</div>
          </div>
          <div style={{ height: '200px', background: 'var(--admin-gray-50)', borderRadius: 'var(--admin-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-gray-500)' }}>
            📊 グラフエリア（Chart.js等で実装予定）
          </div>
        </div>

        {/* 親密度分布チャート（ダミー） */}
        <div className="admin-chart-container">
          <div className="admin-chart-header">
            <div className="admin-chart-title">親密度レベル分布</div>
            <div className="admin-badge admin-badge--primary">リアルタイム</div>
          </div>
          <div style={{ height: '200px', background: 'var(--admin-gray-50)', borderRadius: 'var(--admin-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-gray-500)' }}>
            🥧 円グラフエリア（Chart.js等で実装予定）
          </div>
        </div>
      </div>

      {/* システム状態 */}
      <div style={{ marginTop: 'var(--admin-space-8)' }}>
        <div className="admin-card">
          <h3 style={{ margin: '0 0 var(--admin-space-4) 0', fontSize: 'var(--admin-font-size-lg)', fontWeight: '600' }}>
            システム状態
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--admin-space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--admin-success-500)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: 'var(--admin-font-size-sm)' }}>データベース接続</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--admin-success-500)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: 'var(--admin-font-size-sm)' }}>OpenAI API</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--admin-success-500)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: 'var(--admin-font-size-sm)' }}>Stripe決済</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--admin-warning-500)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: 'var(--admin-font-size-sm)' }}>ファイルストレージ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 