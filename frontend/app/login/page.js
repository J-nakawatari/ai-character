'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';
import BackButton from '../components/BackButton';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  
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
    <div className="auth-layout">
      <div className="auth-layout__background">
        <div className="auth-layout__bubble auth-layout__bubble--1"></div>
        <div className="auth-layout__bubble auth-layout__bubble--2"></div>
        <div className="auth-layout__bubble auth-layout__bubble--3"></div>
      </div>
      
      <BackButton to="/" />
      
      <div className="card auth-layout__card">
        <div className="card__body">
          <h1 className="auth-layout__title">ログイン</h1>
          
          {serverError && (
            <div className="input__error-message mb-3">
              {serverError === 'Invalid credentials'
                ? 'メールアドレスまたはパスワードが正しくありません'
                : serverError === 'Login failed'
                  ? 'ログインに失敗しました'
                  : serverError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="auth-layout__form">
            <div className="input-group">
              <label className="input__label">メールアドレス</label>
              <input
                className="input"
                type="email"
                placeholder="メールアドレスを入力してください"
                {...register('email')}
              />
              {errors.email && (
                <p className="input__error-message">
                  {errors.email.message === 'Invalid email address' 
                    ? '有効なメールアドレスを入力してください' 
                    : errors.email.message}
                </p>
              )}
            </div>
            
            <div className="input-group">
              <label className="input__label">パスワード</label>
              <input
                className="input"
                type="password"
                placeholder="パスワードを入力してください"
                {...register('password')}
              />
              {errors.password && (
                <p className="input__error-message">
                  {errors.password.message === 'Password is required' 
                    ? 'パスワードを入力してください' 
                    : errors.password.message}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="button button--primary button--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          
          <div className="auth-layout__footer">
            <p>
              アカウントをお持ちでない方は
              <Link href="/register" className="auth-layout__link">こちら</Link>
              から新規登録できます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
