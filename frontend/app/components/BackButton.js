'use client';

import { useRouter, usePathname } from 'next/navigation';
import { getLocaleFromPath } from '../i18n-config';

export default function BackButton({ to, className = '', label = '戻る' }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  
  const handleClick = () => {
    if (to) {
      router.push(to.startsWith('/') && !to.startsWith(`/${locale}`) ? `/${locale}${to}` : to);
    } else {
      router.back();
    }
  };
  
  return (
    <button 
      onClick={handleClick} 
      className={`nav-button nav-button--top-left ${className}`}
      aria-label="戻る"
    >
      <span className="nav-button__icon">←</span>
      <span className="nav-button__text">戻る</span>
    </button>
  );
}
