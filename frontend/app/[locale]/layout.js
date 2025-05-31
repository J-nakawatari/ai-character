'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider, useAuth } from '../utils/auth';
import ModernLayout from '../components/ModernLayout';
import ChatLayout from '../components/ChatLayout';
import { usePathname, useRouter } from 'next/navigation';
import { use } from 'react';

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
        <LocaleLayoutInner locale={locale}>
          {children}
        </LocaleLayoutInner>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

function LocaleLayoutInner({ children, locale }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const hideSidebar = pathname === `/${locale}` ||
                      pathname.startsWith(`/${locale}/login`) || 
                      pathname.startsWith(`/${locale}/register`);
  const isHome = pathname === `/${locale}`;
  const isChat = pathname.startsWith(`/${locale}/chat`);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  if (hideSidebar || isHome) {
    return (
      <div className={`app-layout${isHome ? ' home-main' : ''}`}>
        {isHome ? (
          children
        ) : (
          <main className="app-main full-width">
            {children}
          </main>
        )}
      </div>
    );
  }

  if (isChat) {
    return (
      <ChatLayout
        user={user}
        onLogout={handleLogout}
        locale={locale}
      >
        {children}
      </ChatLayout>
    );
  }

  return (
    <ModernLayout
      isAdmin={false}
      user={user}
      onLogout={handleLogout}
      locale={locale}
      showSidebar={true}
    >
      {children}
    </ModernLayout>
  );
}
