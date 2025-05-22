'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '../utils/auth';
import { AdminAuthProvider } from '../utils/adminAuth';
import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';

export default function LocaleLayout({ children, params }) {
  const locale = params.locale || 'ja';
  const pathname = usePathname();
  const isAdmin = pathname.startsWith(`/${locale}/admin`);
  const hideSidebar = pathname.startsWith(`/${locale}/login`) || 
                      pathname.startsWith(`/${locale}/register`) || 
                      pathname.startsWith(`/${locale}/setup`) || 
                      isAdmin;
  
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
        <AdminAuthProvider>
          <div className="app-layout">
            {!hideSidebar && <Sidebar />}
            <main className="app-main">
              {children}
            </main>
          </div>
        </AdminAuthProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
