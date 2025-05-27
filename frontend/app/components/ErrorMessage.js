'use client';

import { useTranslations } from 'next-intl';

export default function ErrorMessage({ 
  message, 
  type = 'inline', // 'inline' | 'toast' | 'modal'
  className = '',
  onClose,
  duration = 3000
}) {
  const t = useTranslations('errors');

  // エラーメッセージの翻訳
  const translatedMessage = typeof message === 'string' && message in t 
    ? t(message)
    : message;

  // インライン表示（フォームの下など）
  if (type === 'inline') {
    return (
      <p className={`error-message ${className}`}>
        {translatedMessage}
      </p>
    );
  }

  // トースト表示（画面中央）
  if (type === 'toast') {
    return (
      <div className={`toast-center ${className}`}>
        <div className="toast-title">
          <span className="toast-icon">✕</span>
          Error
        </div>
        <div className="toast-message">{translatedMessage}</div>
      </div>
    );
  }

  // モーダル内表示
  if (type === 'modal') {
    return (
      <div className={`modal-error ${className}`}>
        {translatedMessage}
      </div>
    );
  }

  return null;
} 