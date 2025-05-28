'use client';
import './globals.css';
import './styles/setup.css';
import './styles/dashboard.css';
import './styles/pages/mypage.css';
import './styles/admin.css';
import { M_PLUS_Rounded_1c, Orbitron } from "next/font/google";

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

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${mPlusRounded.variable} ${orbitron.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
};
