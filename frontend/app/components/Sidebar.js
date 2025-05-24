import Link from 'next/link';
import { useAuth } from '../utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import { getLocaleFromPath } from '../i18n-config';
import styles from './Sidebar.module.css';
import { useTranslations } from 'next-intl';

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = useTranslations('menu');

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push(`/${locale}/login`);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__logo}>
        {/* ロゴや他の要素があればここに残す。戻るボタンは削除 */}
      </div>
      <nav className={styles.sidebar__nav}>
        <ul className={styles.sidebar__list}>
          <li className={pathname.startsWith(`/${locale}/dashboard`) ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href={`/${locale}/dashboard`} className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* Dashboard Icon (from public/icon/dashboard.svg) */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 8C4.55228 8 5 7.55228 5 7C5 6.44772 4.55228 6 4 6C3.44772 6 3 6.44772 3 7C3 7.55228 3.44772 8 4 8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 7C8 7.55228 7.55228 8 7 8C6.44772 8 6 7.55228 6 7C6 6.44772 6.44772 6 7 6C7.55228 6 8 6.44772 8 7Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10 8C10.5523 8 11 7.55228 11 7C11 6.44772 10.5523 6 10 6C9.44771 6 9 6.44772 9 7C9 7.55228 9.44771 8 10 8Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 3C1.34315 3 0 4.34315 0 6V18C0 19.6569 1.34315 21 3 21H21C22.6569 21 24 19.6569 24 18V6C24 4.34315 22.6569 3 21 3H3ZM21 5H3C2.44772 5 2 5.44772 2 6V9H22V6C22 5.44772 21.5523 5 21 5ZM2 18V11H22V18C22 18.5523 21.5523 19 21 19H3C2.44772 19 2 18.5523 2 18Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className={styles.sidebar__text}>{t('dashboard')}</span>
            </Link>
          </li>
          <li className={pathname.startsWith(`/${locale}/chat`) ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href={`/${locale}/chat`} className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* Chat Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16v12H5.17L4 17.17V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>{t('chat')}</span>
            </Link>
          </li>
          <li className={pathname.startsWith(`/${locale}/setup`) ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href={`/${locale}/setup?reselect=true`} className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* Edit/Pen Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16.862 5.487l1.65-1.65a1.5 1.5 0 1 1 2.121 2.122l-1.65 1.65m-2.121-2.122l-9.193 9.193a2 2 0 0 0-.497.828l-1.03 3.09a.5.5 0 0 0 .632.632l3.09-1.03a2 2 0 0 0 .828-.497l9.193-9.193m-2.121-2.122 2.121 2.122" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>{t('setup')}</span>
            </Link>
          </li>
          <li className={pathname.startsWith(`/${locale}/mypage`) ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href={`/${locale}/mypage`} className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                {/* User Icon (Outline) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <span className={styles.sidebar__text}>{t('mypage')}</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className={styles.sidebar__logout}>
        <button className={styles.sidebar__logoutBtn} onClick={handleLogout}>
          <span className={styles.sidebar__icon}>
            {/* Logout Icon (from public/icon/log-out.svg) */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.51428 20H4.51428C3.40971 20 2.51428 19.1046 2.51428 18V6C2.51428 4.89543 3.40971 4 4.51428 4H8.51428V6H4.51428V18H8.51428V20Z"
                fill="currentColor"
              />
              <path
                d="M13.8418 17.385L15.262 15.9768L11.3428 12.0242L20.4857 12.0242C21.038 12.0242 21.4857 11.5765 21.4857 11.0242C21.4857 10.4719 21.038 10.0242 20.4857 10.0242L11.3236 10.0242L15.304 6.0774L13.8958 4.6572L7.5049 10.9941L13.8418 17.385Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className={styles.sidebar__text}>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}  