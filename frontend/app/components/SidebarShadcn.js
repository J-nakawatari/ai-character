import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function SidebarShadcn({ onLogout }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={styles.sidebar + ' sidebar--admin'}>
      <p className={styles['sidebar--logo']}>Charactier AI</p>
      <nav className={styles.sidebar__nav}>
        <ul className={styles.sidebar__list}>
          <li className={pathname.startsWith('/admin/dashboard') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/admin/dashboard" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
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
              <span className={styles.sidebar__text}>ダッシュボード</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/admin/users') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/admin/users" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 14C9.55228 14 10 13.5523 10 13C10 12.4477 9.55228 12 9 12C8.44771 12 8 12.4477 8 13C8 13.5523 8.44771 14 9 14Z"
                    fill="currentColor"
                  />
                  <path
                    d="M16 13C16 13.5523 15.5523 14 15 14C14.4477 14 14 13.5523 14 13C14 12.4477 14.4477 12 15 12C15.5523 12 16 12.4477 16 13Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 11.1637 19.8717 10.3574 19.6337 9.59973C18.7991 9.82556 17.9212 9.94604 17.0152 9.94604C13.2921 9.94604 10.0442 7.91139 8.32277 4.89334C5.75469 6.22486 4 8.90751 4 12C4 16.4183 7.58172 20 12 20Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className={styles.sidebar__text}>ユーザー管理</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/admin/characters') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/admin/characters" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15 4H21V10H15V4Z" fill="currentColor" />
                  <path
                    d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12H3Z"
                    fill="currentColor"
                  />
                  <path
                    d="M6 10C7.65685 10 9 8.65685 9 7C9 5.34315 7.65685 4 6 4C4.34315 4 3 5.34315 3 7C3 8.65685 4.34315 10 6 10Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className={styles.sidebar__text}>キャラクター管理</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/admin/settings') ? styles.sidebar__item + ' ' + styles['sidebar__item--active'] : styles.sidebar__item}>
            <Link href="/admin/settings" className={styles.sidebar__link}>
              <span className={styles.sidebar__icon}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H5C3.89543 16 3 15.1046 3 14V6ZM5 6H19V14H5V6Z"
                    fill="currentColor"
                  />
                  <path
                    d="M2 18C1.44772 18 1 18.4477 1 19C1 19.5523 1.44772 20 2 20H22C22.5523 20 23 19.5523 23 19C23 18.4477 22.5523 18 22 18H2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className={styles.sidebar__text}>システム設定</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className={styles.sidebar__logout}>
        <button className={styles.sidebar__logoutBtn} onClick={onLogout}>
          <span className={styles.sidebar__icon}>
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
          <span className={styles.sidebar__text}>ログアウト</span>
        </button>
      </div>
    </aside>
  );
} 