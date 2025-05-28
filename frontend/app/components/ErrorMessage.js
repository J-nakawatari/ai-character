'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function ErrorMessage({ 
  message, 
  type = 'inline', // 'inline' | 'modal'
  className = ''
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