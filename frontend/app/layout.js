import { Geist, Geist_Mono } from "next/font/google";
import { M_PLUS_Rounded_1c, Orbitron } from "next/font/google";
import "./globals.css";
import "./styles/main.css";
import { AuthProvider } from "./utils/auth";
import { AdminAuthProvider } from "./utils/adminAuth";

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

export const metadata = {
  title: "AI Character App",
  description: "An AI character membership site",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mPlusRounded.variable} ${orbitron.variable} antialiased`}
      >
        <AuthProvider>
          <AdminAuthProvider>
            {children}
            <button className="theme-toggle" id="theme-toggle" aria-label="テーマ切り替え">
              <span className="theme-toggle__icon theme-toggle__icon--sun">☀️</span>
              <span className="theme-toggle__icon theme-toggle__icon--moon">🌙</span>
            </button>
          </AdminAuthProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark-mode');
                }
                
                document.addEventListener('DOMContentLoaded', function() {
                  const themeToggle = document.getElementById('theme-toggle');
                  if (themeToggle) {
                    themeToggle.addEventListener('click', () => {
                      document.documentElement.classList.toggle('dark-mode');
                      const isDark = document.documentElement.classList.contains('dark-mode');
                      localStorage.setItem('theme', isDark ? 'dark' : 'light');
                    });
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
