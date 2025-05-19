'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ to, className = '' }) {
  const router = useRouter();
  
  const handleClick = () => {
    if (to) {
      router.push(to);
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
