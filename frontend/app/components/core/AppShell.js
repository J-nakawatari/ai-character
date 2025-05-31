'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './AppShell.module.css';
import TopBar from './TopBar';
import QuickActions from './QuickActions';
import ContextPanel from './ContextPanel';

/**
 * AppShell - アプリケーションの核となるシェル
 * 従来のサイドバー型ではなく、コンテキスト認識型UI
 */
const AppShell = ({ 
  children, 
  user, 
  isAdmin = false,
  onLogout,
  locale = 'ja',
  tokenBalance,
  remainingFreeChats,
  isBaseCharacter
}) => {
  const pathname = usePathname();
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState('default');

  // ページに応じてコンテキストを決定
  useEffect(() => {
    if (pathname.includes('/chat')) {
      setCurrentContext('chat');
    } else if (pathname.includes('/dashboard')) {
      setCurrentContext('overview');
    } else if (pathname.includes('/characters')) {
      setCurrentContext('character-management');
    } else if (pathname.includes('/users')) {
      setCurrentContext('user-management');
    } else if (pathname.includes('/setup')) {
      setCurrentContext('character-selection');
    } else if (pathname.includes('/mypage')) {
      setCurrentContext('profile');
    } else {
      setCurrentContext('default');
    }
  }, [pathname]);

  return (
    <div className={styles.appShell}>
      {/* トップバー：最小限の情報とアクション */}
      <TopBar 
        user={user}
        isAdmin={isAdmin}
        onLogout={onLogout}
        currentContext={currentContext}
        onContextToggle={() => setContextPanelOpen(!contextPanelOpen)}
        locale={locale}
        tokenBalance={tokenBalance}
        remainingFreeChats={remainingFreeChats}
        isBaseCharacter={isBaseCharacter}
      />

      {/* メインワークスペース */}
      <main className={styles.workspace}>
        <div className={styles.contentArea}>
          {children}
        </div>

        {/* コンテキストパネル：状況に応じた機能 */}
        <ContextPanel 
          isOpen={contextPanelOpen}
          context={currentContext}
          user={user}
          isAdmin={isAdmin}
          onClose={() => setContextPanelOpen(false)}
          locale={locale}
        />
      </main>

      {/* クイックアクション：フローティングボタン */}
      <QuickActions 
        context={currentContext}
        user={user}
        isAdmin={isAdmin}
        locale={locale}
      />
    </div>
  );
};

export default AppShell;