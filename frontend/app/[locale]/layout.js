'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider, useAuth } from '../utils/auth';
import { ChatContextProvider, useChatContext } from '../contexts/ChatContext';
import AppShell from '../components/core/AppShell';
import { usePathname, useRouter } from 'next/navigation';
import { use } from 'react';

/**
 * ユーザーレイアウト - 完全ゼロベース設計
 * 多言語対応とコンテキスト認識型UIを統合
 */
export default function LocaleLayout({ children, params }) {
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  
  let messages;
  try {
    messages = require(`../../messages/${locale}.json`);
  } catch (error) {
    console.error(`Could not load messages for locale "${locale}"`, error);
    messages = require('../../messages/ja.json');
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <ChatContextProvider>
          <LocaleLayoutInner locale={locale}>
            {children}
          </LocaleLayoutInner>
        </ChatContextProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

function LocaleLayoutInner({ children, locale }) {
  const { user, logout, loading } = useAuth();
  const { chatInfo } = useChatContext();
  const pathname = usePathname();
  const router = useRouter();
  
  const isPublicPage = pathname === `/${locale}` ||
                      pathname.startsWith(`/${locale}/login`) || 
                      pathname.startsWith(`/${locale}/register`);
  const isHomePage = pathname === `/${locale}`;
  const isChatPage = pathname.startsWith(`/${locale}/chat`);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  // ローディング状態
  if (loading && !isPublicPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '32px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '320px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 8px 0' }}>
            読み込み中...
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            アプリケーションを準備しています
          </p>
        </div>
      </div>
    );
  }

  // パブリックページ（ホーム、ログイン、登録）
  if (isPublicPage) {
    if (isHomePage) {
      return children; // TOPページはそのまま表示
    }
    
    // ログイン・登録ページは最小限のレイアウト
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          margin: '0 16px'
        }}>
          {children}
        </div>
      </div>
    );
  }

  // チャットページは特別なレイアウト
  if (isChatPage) {
    return (
      <AppShell
        user={user}
        onLogout={handleLogout}
        locale={locale}
        isAdmin={false}
        tokenBalance={chatInfo.tokenBalance}
        remainingFreeChats={chatInfo.remainingFreeChats}
        isBaseCharacter={chatInfo.isBaseCharacter}
        affinityData={chatInfo.affinityData}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent'
        }}>
          {children}
        </div>
      </AppShell>
    );
  }

  // 認証が必要なページ
  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      locale={locale}
      isAdmin={false}
    >
      {children}
    </AppShell>
  );
}