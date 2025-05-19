import Link from 'next/link';
import { useAuth } from '../utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };

  return (
    <aside className={styles.sidebar + ' sidebar--user'}>
      <div className={styles.sidebar__logo}>
        <Link href="/setup?reselect=true" className={styles.sidebar__backLink}>
          <span className={styles.sidebar__text}>← 戻る</span>
        </Link>
      </div>
      <nav className={styles.sidebar__nav}>
        <ul className={styles.sidebar__list}>
          <li className={pathname.startsWith('/dashboard') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/dashboard" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* Home Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12L12 5l9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>ダッシュボード</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/chat') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/chat" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* Chat Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16v12H5.17L4 17.17V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>チャット</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/setup') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/setup?reselect=true" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* Edit/Pen Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16.862 5.487l1.65-1.65a1.5 1.5 0 1 1 2.121 2.122l-1.65 1.65m-2.121-2.122l-9.193 9.193a2 2 0 0 0-.497.828l-1.03 3.09a.5.5 0 0 0 .632.632l3.09-1.03a2 2 0 0 0 .828-.497l9.193-9.193m-2.121-2.122 2.121 2.122" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>キャラを変更</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/mypage') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/mypage" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* User Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>マイページ</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className={styles.sidebar__logout}>
        <button className={styles.sidebar__logoutBtn} onClick={handleLogout}>
          <span className={styles.sidebar__icon}>
            {/* Logout Icon (Outline) */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 5v-2a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className={styles.sidebar__text}>ログアウト</span>
        </button>
      </div>
    </aside>
  );
} 