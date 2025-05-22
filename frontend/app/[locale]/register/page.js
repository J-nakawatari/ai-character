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

const schema = (t) => z.object({
  name: z.string().min(2, t('auth.validation.name_min_length')),
  email: z.string().email(t('auth.validation.invalid_email')),
  password: z.string().min(6, t('auth.validation.password_min_length')),
  preferredLanguage: z.enum(['ja', 'en']),
});

export default function Register({ params }) {
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
    resolver: zodResolver(schema(t)),
  });
  
  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await registerUser(data);
    
    if (result.success) {
      router.push(`/${params.locale}/setup`);
    } else {
      const errorMessages = {
        'User already exists': t('user_already_exists'),
        'Registration failed': t('registration_failed'),
        'Invalid email format': t('invalid_email_format'),
        'Password too short': t('password_too_short'),
        'Invalid password format': t('invalid_password_format'),
        'Server error': t('server_error'),
        'Network error': t('network_error')
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
      
      <BackButton to={`/${params.locale}`} />
      
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
                placeholder={t('name_placeholder')}
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
                placeholder={t('email_placeholder')}
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
                placeholder={t('password_placeholder')}
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
              <Link href={`/${params.locale}/login`} className="auth-layout__link">{t('login_button')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
