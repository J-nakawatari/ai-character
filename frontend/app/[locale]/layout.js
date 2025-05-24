'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '../utils/auth';
import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';
import { use } from 'react';

export default function LocaleLayout({ children, params }) {
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const pathname = usePathname();
  const hideSidebar = pathname === `/${locale}` ||
                      pathname.startsWith(`/${locale}/login`) || 
                      pathname.startsWith(`/${locale}/register`);
  const isHome = pathname === `/${locale}`;
  
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
        <div className={`app-layout${isHome ? ' home-main' : ''}`}>
          {!hideSidebar && <Sidebar />}
          {isHome ? (
            children
          ) : (
            <main className={`app-main${hideSidebar ? ' full-width' : ''}`}>
              {children}
            </main>
          )}
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
