'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';
import BackButton from '../components/BackButton';
import { useTranslations } from 'next-intl';

const schema = z.object({
  name: z.string().min(2, 'お名前は2文字以上で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  preferredLanguage: z.enum(['ja', 'en']),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const t = useTranslations('auth');
  const tMypage = useTranslations('mypage');
  
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
    <div className="auth-layout">
      <div className="auth-layout__background">
        <div className="auth-layout__bubble auth-layout__bubble--1"></div>
        <div className="auth-layout__bubble auth-layout__bubble--2"></div>
        <div className="auth-layout__bubble auth-layout__bubble--3"></div>
      </div>
      
      <BackButton to="/" />
      
      <div className="card auth-layout__card">
        <div className="card__body">
          <h1 className="auth-layout__title">{t('register_title')}</h1>
          
          {serverError && (
            <div className="input__error-message mb-3">
              {serverError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="auth-layout__form">
            <div className="input-group">
              <label className="input__label">{t('name')}</label>
              <input
                className="input"
                type="text"
                placeholder="お名前を入力してください"
                {...register('name')}
              />
              {errors.name && (
                <p className="input__error-message">{errors.name.message}</p>
              )}
            </div>
            
            <div className="input-group">
              <label className="input__label">{t('email')}</label>
              <input
                className="input"
                type="email"
                placeholder="メールアドレスを入力してください"
                {...register('email')}
              />
              {errors.email && (
                <p className="input__error-message">{errors.email.message}</p>
              )}
            </div>
            
            <div className="input-group">
              <label className="input__label">{t('password')}</label>
              <input
                className="input"
                type="password"
                placeholder="パスワードを入力してください"
                {...register('password')}
              />
              {errors.password && (
                <p className="input__error-message">{errors.password.message}</p>
              )}
            </div>
            
            <div className="input-group">
              <label className="input__label">{tMypage('language_settings')}</label>
              <div className="language-options">
                <label className="language-option">
                  <input
                    type="radio"
                    value="ja"
                    {...register('preferredLanguage')}
                    defaultChecked
                  />
                  <span className="language-flag">🇯🇵</span>
                  <span className="language-name">{tMypage('language_japanese')}</span>
                </label>
                <label className="language-option">
                  <input
                    type="radio"
                    value="en"
                    {...register('preferredLanguage')}
                  />
                  <span className="language-flag">🇺🇸</span>
                  <span className="language-name">{tMypage('language_english')}</span>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              className="button button--primary button--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('registering') : t('register_button')}
            </button>
          </form>
          
          <div className="auth-layout__footer">
            <p>
              {t('already_have_account')}
              <Link href="/login" className="auth-layout__link">{t('login_button')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
