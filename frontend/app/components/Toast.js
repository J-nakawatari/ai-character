'use client';

import { useEffect, useState } from 'react';

export default function Toast({ show, message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(show);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 500); // フェードアウト用
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!visible) return null;

  const toastTitles = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
  };
  const toastIcons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`toast-center${hide ? ' hide' : ''}`}> 
      <div className="toast-title">
        <span className="toast-icon">{toastIcons[type] || toastIcons.info}</span>
        {toastTitles[type] || toastTitles.info}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
}
