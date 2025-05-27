'use client';

import { useState, use, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../utils/auth';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';
import styles from '../login/page.module.css';
import ErrorMessage from '../../components/ErrorMessage';

const schema = (t) => z.object({
  name: z.string().min(2, t('validation.name_min_length')),
  email: z.string().email(t('validation.invalid_email')),
  password: z.string().min(6, t('validation.password_min_length')),
  preferredLanguage: z.enum(['ja', 'en']),
});

const videoFiles = [
  '/videos/hero-videos_01.mp4',
  '/videos/hero-videos_02.mp4',
  '/videos/hero-videos_03.mp4',
];

export default function Register({ params }) {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const t = useTranslations('auth');
  const tMypage = useTranslations('mypage');
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema(t)),
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);
  const currentIndexRef = useRef(0);
  const activeVideoRef = useRef(1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const switchToNextVideo = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = (currentIndexRef.current + 1) % videoFiles.length;
    currentIndexRef.current = nextIndex;
    const inactiveRef = activeVideoRef.current === 1 ? videoRef2 : videoRef1;
    if (inactiveRef.current) {
      inactiveRef.current.src = videoFiles[nextIndex];
      inactiveRef.current.load();
      inactiveRef.current.play();
    }
    setTimeout(() => {
      const newActiveVideo = activeVideoRef.current === 1 ? 2 : 1;
      activeVideoRef.current = newActiveVideo;
      setActiveVideo(newActiveVideo);
      setCurrentVideoIndex(nextIndex);
      setIsTransitioning(false);
      const activeRef = newActiveVideo === 1 ? videoRef1 : videoRef2;
      if (activeRef.current) {
        activeRef.current.play();
      }
    }, 2000);
  };

  useEffect(() => {
    currentIndexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

  useEffect(() => {
    const timeout = setTimeout(switchToNextVideo, 7000);
    return () => clearTimeout(timeout);
  }, [switchToNextVideo]);

  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await registerUser(data);
    
    if (result.success) {
      router.push(`/${locale}/setup`);
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
    <>
      {isMobile ? (
        <img
          src="/images/background-mobile.jpg"
          alt="背景"
          className={styles['background-image']}
        />
      ) : (
        <>
          <video
            ref={videoRef1}
            autoPlay
            muted
            loop
            playsInline
            className={`${styles['background-video']} ${activeVideo === 1 ? styles.active : ''}`}
          >
            <source src={videoFiles[currentVideoIndex]} type="video/mp4" />
            お使いのブラウザはvideoタグをサポートしていません。
          </video>
          <video
            ref={videoRef2}
            autoPlay
            muted
            loop
            playsInline
            className={`${styles['background-video']} ${activeVideo === 2 ? styles.active : ''}`}
          >
            <source src={videoFiles[(currentVideoIndex + 1) % videoFiles.length]} type="video/mp4" />
            お使いのブラウザはvideoタグをサポートしていません。
          </video>
        </>
      )}
      <div className={styles['darken-overlay']} />
      <div className={`container ${styles['login-container']}`}>
        <div className={styles['login-card']}>
          <h1 className={styles['login-title']}>{t('register_title')}</h1>

          {serverError && (
            <ErrorMessage
              message={serverError}
              type="inline"
              className={styles['error-message']}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form']}>
            <div className={styles['input-group']}>
              <label className={styles['input-label']}>{t('name')}</label>
              <input
                className={styles.input}
                type="text"
                placeholder={t('name_placeholder')}
                {...register('name')}
              />
              {errors.name && (
                <ErrorMessage
                  message={errors.name.message}
                  type="inline"
                  className={styles['error-message']}
                />
              )}
            </div>

            <div className={styles['input-group']}>
              <label className={styles['input-label']}>{t('email')}</label>
              <input
                className={styles.input}
                type="email"
                placeholder={t('email_placeholder')}
                {...register('email')}
              />
              {errors.email && (
                <ErrorMessage
                  message={errors.email.message}
                  type="inline"
                  className={styles['error-message']}
                />
              )}
            </div>

            <div className={styles['input-group']}>
              <label className={styles['input-label']}>{t('password')}</label>
              <input
                className={styles.input}
                type="password"
                placeholder={t('password_placeholder')}
                {...register('password')}
              />
              {errors.password && (
                <ErrorMessage
                  message={errors.password.message}
                  type="inline"
                  className={styles['error-message']}
                />
              )}
            </div>

            <div className={styles['input-group']}>
              <label className={styles['input-label']}>{tMypage('language_settings')}</label>
              <select
                className={styles.input}
                {...register('preferredLanguage')}
                defaultValue="ja"
              >
                <option value="ja">🇯🇵 {tMypage('language_japanese')}</option>
                <option value="en">🇺🇸 {tMypage('language_english')}</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles['login-button']}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('registering') : t('register_button')}
            </button>
          </form>

          <div className={styles['register-link-container']}>
            <p className={styles['register-link-text']}>
              すでにアカウントをお持ちの方は<br />
              {'こちらから'}<Link href={`/${locale}/login`} className={styles['register-link']}>ログイン</Link>{'できます'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
