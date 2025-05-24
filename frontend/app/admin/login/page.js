'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/utils/adminAuth';
import { useRouter } from 'next/navigation';
import GlobalLoading from '@/components/GlobalLoading';

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await adminLogin({ email, password });
      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <GlobalLoading text="ログイン中..." />;
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="admin-login-title">管理者ログイン</h1>
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input"
            />
          </div>
          <button type="submit" className="admin-button admin-button--primary admin-button--full">
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
} 