'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import api from '@/utils/api';
import GlobalLoading from '@/components/GlobalLoading';
import '../../styles/admin-design-system.css';

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
        const paidUsers = users.filter(user => 
          user.tokenBalance && user.tokenBalance > 0
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

        // チャット統計を取得
        const chatsRes = await api.get('/admin/stats/chats');
        const { totalChats, todayChats } = chatsRes.data || { totalChats: 0, todayChats: 0 };

        setStats({
          userCount: users.length,
          characterCount: characters.length,
          activeUsers,
          paidUsers,
          totalChats,
          todayChats,
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
        </div>

        {/* アクティブユーザー */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--success">
            ✨
          </div>
          <div className="admin-stats-value">{stats.activeUsers.toLocaleString()}</div>
          <div className="admin-stats-label">アクティブユーザー</div>
        </div>

        {/* トークチケット保有ユーザー */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--warning">
            💎
          </div>
          <div className="admin-stats-value">{stats.paidUsers.toLocaleString()}</div>
          <div className="admin-stats-label">トークチケット保有ユーザー</div>
        </div>

        {/* キャラクター数 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--secondary">
            🤖
          </div>
          <div className="admin-stats-value">{stats.characterCount.toLocaleString()}</div>
          <div className="admin-stats-label">AIキャラクター数</div>
        </div>

        {/* 総チャット数 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--primary">
            💬
          </div>
          <div className="admin-stats-value">{stats.totalChats.toLocaleString()}</div>
          <div className="admin-stats-label">総チャット数</div>
        </div>

        {/* 今日のチャット */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--success">
            📈
          </div>
          <div className="admin-stats-value">{stats.todayChats.toLocaleString()}</div>
          <div className="admin-stats-label">今日のチャット数</div>
        </div>

        {/* 平均親密度 */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon admin-stats-icon--primary">
            💖
          </div>
          <div className="admin-stats-value">{stats.avgAffinity}</div>
          <div className="admin-stats-label">平均親密度レベル</div>
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