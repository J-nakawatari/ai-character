'use client';
import { Geist, Geist_Mono } from "next/font/google";
import { M_PLUS_Rounded_1c, Orbitron } from "next/font/google";
import './globals.css';
import './styles/setup.css';
import './styles/dashboard.css';
import './styles/pages/mypage.css';

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

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mPlusRounded.variable} ${orbitron.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
};
