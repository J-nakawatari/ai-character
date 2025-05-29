'use client';

import { useState, use, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../utils/auth';
import { useTranslations } from 'next-intl';
import { Orbitron } from 'next/font/google';
import styles from './page.module.css';
import ErrorMessage from '../../components/ErrorMessage';

const orbitron = Orbitron({ weight: '700', subsets: ['latin'] });

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const videoFiles = [
  '/videos/hero-videos_01.mp4',
  '/videos/hero-videos_02.mp4',
  '/videos/hero-videos_03.mp4',
];

export default function Login({ params }) {
  const auth = useAuth();
  const { login, user } = auth || {};
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const t = useTranslations('auth');
  const appT = useTranslations('app');
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);
  const currentIndexRef = useRef(0);
  const activeVideoRef = useRef(1);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

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
  }, []);
  
  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await login(data);
    
    if (result.success) {
      if (user?.hasCompletedSetup) {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/setup`);
      }
    } else {
      setServerError(result.error);
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
          <h1 className={`${orbitron.className} ${styles['login-title']}`}>{t('login_title')}</h1>
          
          {serverError && (
            <ErrorMessage
              message={serverError}
              type="inline"
              className={styles['error-message']}
            />
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form']}>
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
                  message={errors.email.message === 'Invalid email address' ? 'validation.invalid_email' : errors.email.message}
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
                  message={errors.password.message === 'Password is required' ? 'validation.password_required' : errors.password.message}
                  type="inline"
                  className={styles['error-message']}
                />
              )}
            </div>
            
            <button
              type="submit"
              className={`${orbitron.className} ${styles['login-button']}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('logging_in') : t('login_button')}
            </button>
          </form>
          
          <div className={styles['register-link-container']}>
            <p className={styles['register-link-text']}>
              {t('dont_have_account')}{' '}
              <Link href={`/${locale}/register`} className={styles['register-link']}>
                {t('register')}
              </Link>
            </p>
          </div>
        </div>
        <div className={styles['back-link-container']}>
          <Link href={`/${locale}`} className={styles['back-link']}>
            {appT('back_to_top')}
          </Link>
        </div>
      </div>
    </>
  );
}
