'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './QuickActions.module.css';

/**
 * QuickActions - コンテキスト認識型フローティングアクション
 * 現在の画面で最も使いそうなアクションを提供
 */
const QuickActions = ({ 
  context, 
  user, 
  isAdmin, 
  locale 
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // コンテキストに応じたアクションを定義
  const getActions = () => {
    switch (context) {
      case 'chat':
        return [
          {
            icon: '🔄',
            label: '新しい会話',
            action: () => window.location.reload(),
            primary: true
          },
          {
            icon: '✨',
            label: 'キャラクター変更',
            action: () => router.push(`/${locale}/setup?reselect=true`)
          },
          {
            icon: '📋',
            label: '会話履歴',
            action: () => console.log('会話履歴')
          }
        ];

      case 'overview':
        if (isAdmin) {
          return [
            {
              icon: '➕',
              label: '新規作成',
              action: () => router.push('/admin/characters/new'),
              primary: true
            },
            {
              icon: '👥',
              label: 'ユーザー管理',
              action: () => router.push('/admin/users')
            },
            {
              icon: '📊',
              label: 'レポート',
              action: () => console.log('レポート')
            }
          ];
        } else {
          return [
            {
              icon: '💬',
              label: 'チャット開始',
              action: () => router.push(`/${locale}/chat`),
              primary: true
            },
            {
              icon: '✨',
              label: 'キャラクター選択',
              action: () => router.push(`/${locale}/setup`)
            }
          ];
        }

      case 'character-management':
        return [
          {
            icon: '➕',
            label: '新規キャラクター',
            action: () => router.push('/admin/characters/new'),
            primary: true
          },
          {
            icon: '📁',
            label: 'インポート',
            action: () => console.log('インポート')
          },
          {
            icon: '🔄',
            label: '更新',
            action: () => window.location.reload()
          }
        ];

      case 'user-management':
        return [
          {
            icon: '👤',
            label: '新規ユーザー',
            action: () => console.log('新規ユーザー'),
            primary: true
          },
          {
            icon: '📤',
            label: 'エクスポート',
            action: () => console.log('エクスポート')
          },
          {
            icon: '🔄',
            label: '更新',
            action: () => window.location.reload()
          }
        ];

      case 'character-selection':
        return [
          {
            icon: '🎲',
            label: 'ランダム選択',
            action: () => console.log('ランダム選択'),
            primary: true
          },
          {
            icon: '⭐',
            label: 'お気に入り',
            action: () => console.log('お気に入り')
          }
        ];

      case 'profile':
        return [
          {
            icon: '✏️',
            label: 'プロフィール編集',
            action: () => router.push(`/${locale}/mypage#edit`),
            primary: true
          },
          {
            icon: '🔒',
            label: 'セキュリティ',
            action: () => router.push(`/${locale}/mypage#security`)
          }
        ];

      default:
        return [
          {
            icon: '🏠',
            label: 'ホーム',
            action: () => router.push(`/${locale}/dashboard`),
            primary: true
          }
        ];
    }
  };

  const actions = getActions();
  if (actions.length === 0) return null;

  return (
    <div className={styles.quickActions}>
      {/* サブアクション */}
      {isExpanded && actions.slice(1).map((action, index) => (
        <button
          key={index}
          className={styles.subAction}
          onClick={() => {
            action.action();
            setIsExpanded(false);
          }}
          title={action.label}
          style={{
            transform: `translateY(-${(index + 1) * 60}px)`,
            transitionDelay: `${index * 50}ms`
          }}
        >
          <span className={styles.actionIcon}>{action.icon}</span>
          <span className={styles.actionLabel}>{action.label}</span>
        </button>
      ))}

      {/* メインアクション */}
      <button
        className={`${styles.mainAction} ${isExpanded ? styles.expanded : ''}`}
        onClick={() => {
          if (actions.length === 1) {
            actions[0].action();
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        title={actions[0].label}
      >
        <span className={styles.mainIcon}>
          {isExpanded ? '✕' : actions[0].icon}
        </span>
        <span className={styles.mainLabel}>{actions[0].label}</span>
      </button>

      {/* 背景オーバーレイ */}
      {isExpanded && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default QuickActions;