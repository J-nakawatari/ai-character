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
  
  // ダミーデータ: 月ごとの登録ユーザー数（1月〜12月）
  const userStatsByMonth = [
    { month: '1月', count: 12 },
    { month: '2月', count: 18 },
    { month: '3月', count: 25 },
    { month: '4月', count: 20 },
    { month: '5月', count: 30 },
    { month: '6月', count: 22 },
    { month: '7月', count: 15 },
    { month: '8月', count: 10 },
    { month: '9月', count: 8 },
    { month: '10月', count: 14 },
    { month: '11月', count: 19 },
    { month: '12月', count: 24 },
  ];
  
  // ダミーデータ: 月ごとの登録キャラクター数（1月〜12月）
  const characterStatsByMonth = [
    { month: '1月', count: 5 },
    { month: '2月', count: 8 },
    { month: '3月', count: 12 },
    { month: '4月', count: 10 },
    { month: '5月', count: 15 },
    { month: '6月', count: 9 },
    { month: '7月', count: 7 },
    { month: '8月', count: 6 },
    { month: '9月', count: 4 },
    { month: '10月', count: 8 },
    { month: '11月', count: 11 },
    { month: '12月', count: 13 },
  ];
  
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
            <div className="chart-container">
              <svg width="300" height="120">
                {userStatsByMonth.map((data, i) => {
                  const barHeight = (data.count / 30) * 60;
                  return (
                    <g key={i}>
                      <rect
                        x={i * 24 + 20}
                        y={70 - barHeight}
                        width={12}
                        height={barHeight}
                        fill="#DB2777"
                        rx={2}
                      />
                      <text
                        x={i * 24 + 26}
                        y={90}
                        fontSize="12"
                        textAnchor="middle"
                        fill="#6B7A99"
                      >
                        {data.month.split('').map((char, idx) => (
                          <tspan x={i * 24 + 26} y={90 + idx * 12} key={idx}>{char}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          <div className="admin-stats-card">
            <div className="admin-stats-info">
              <div className="admin-stats-title">キャラクター統計</div>
              <div className="admin-stats-value">{stats.characterCount}</div>
              <div className="admin-stats-desc">登録キャラクター数</div>
            </div>
            <div className="chart-container">
              <svg width="300" height="120">
                {characterStatsByMonth.map((data, i) => {
                  const barHeight = (data.count / 15) * 60;
                  return (
                    <g key={i}>
                      <rect
                        x={i * 24 + 20}
                        y={70 - barHeight}
                        width={12}
                        height={barHeight}
                        fill="#DB2777"
                        rx={2}
                      />
                      <text
                        x={i * 24 + 26}
                        y={90}
                        fontSize="12"
                        textAnchor="middle"
                        fill="#6B7A99"
                      >
                        {data.month.split('').map((char, idx) => (
                          <tspan x={i * 24 + 26} y={90 + idx * 12} key={idx}>{char}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
