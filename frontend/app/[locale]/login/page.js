'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../utils/auth';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const t = useTranslations('auth');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await login(data);
    
    if (result.success) {
      if (user?.hasCompletedSetup) {
        router.push('/dashboard');
      } else {
        router.push('/setup');
      }
    } else {
      setServerError(result.error);
    }
  };
  
  return (
    <div className="container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="card">
        <h1 className="auth-layout__title">{t('login_title')}</h1>
        
        {serverError && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            {serverError === 'Invalid credentials'
              ? 'メールアドレスまたはパスワードが正しくありません'
              : serverError === 'Login failed'
                ? 'ログインに失敗しました'
                : serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="input-group">
            <label className="input-label">{t('email')}</label>
            <input
              className="input"
              type="email"
              placeholder={`${t('email')}を入力してください`}
              {...register('email')}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message === 'Invalid email address' ? '有効なメールアドレスを入力してください' : errors.email.message}</p>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">{t('password')}</label>
            <input
              className="input"
              type="password"
              placeholder={`${t('password')}を入力してください`}
              {...register('password')}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message === 'Password is required' ? 'パスワードを入力してください' : errors.password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('logging_in') : t('login_button')}
          </button>
        </form>
        
        <div className="register-link-container">
          <p className="register-link-text">
            {t('dont_have_account')}
            <Link href="/register" className="register-link">{t('register_button')}</Link>
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Link href="/" className="back-link">
          TOPに戻る
        </Link>
      </div>
    </div>
  );
}
