'use client';
import './globals.css';
import './styles/setup.css';
import './styles/dashboard.css';
import './styles/pages/mypage.css';
import './styles/admin.css';
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-orbitron',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${orbitron.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
};
