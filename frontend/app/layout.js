'use client';
import { Geist, Geist_Mono } from "next/font/google";
import { M_PLUS_Rounded_1c, Orbitron } from "next/font/google";
import { AuthProvider } from "./utils/auth";
import { AdminAuthProvider } from "./utils/adminAuth";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";
import { appWithTranslation } from 'next-i18next';
import './globals.css';
import './styles/setup.css';
import './styles/dashboard.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-m-plus-rounded',
});

const orbitron = Orbitron({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-orbitron',
});

export default appWithTranslation(function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const hideSidebar = pathname.startsWith('/login') || pathname.startsWith('/register') || isAdmin;

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mPlusRounded.variable} ${orbitron.variable} antialiased`}
      >
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
      </body>
    </html>
  );
});
