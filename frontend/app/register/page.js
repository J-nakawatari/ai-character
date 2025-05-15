'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';

const schema = z.object({
  name: z.string().min(2, 'お名前は2文字以上で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
});

export default function Register() {
  const { register: registerUser } = useAuth();
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
    
    const result = await registerUser(data);
    
    if (result.success) {
      router.push('/setup');
    } else {
      const errorMessages = {
        'User already exists': 'このメールアドレスは既に登録されています',
        'Registration failed': '登録に失敗しました',
        'Invalid email format': 'メールアドレスの形式が正しくありません',
        'Password too short': 'パスワードが短すぎます',
        'Invalid password format': 'パスワードの形式が正しくありません',
        'Server error': 'サーバーエラーが発生しました',
        'Network error': 'ネットワークエラーが発生しました'
      };
      setServerError(errorMessages[result.error] || result.error);
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6 text-center">新規登録</h1>
        
        {serverError && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="input-group">
            <label className="input-label">お名前</label>
            <input
              className="input"
              type="text"
              placeholder="お名前を入力してください"
              {...register('name')}
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">メールアドレス</label>
            <input
              className="input"
              type="email"
              placeholder="メールアドレスを入力してください"
              {...register('email')}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">パスワード</label>
            <input
              className="input"
              type="password"
              placeholder="パスワードを入力してください"
              {...register('password')}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録する'}
          </button>
        </form>
        
        <div className="register-link-container">
          <p className="register-link-text">
            すでにアカウントをお持ちの方は
            <Link href="/login" className="register-link">こちら</Link>
            からログインできます
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a href="/" className="back-link">
          TOPに戻る
        </a>
      </div>
    </div>
  );
}
