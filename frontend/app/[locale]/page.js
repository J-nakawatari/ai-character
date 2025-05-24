'use client';

import { useEffect, useState, useRef, useLayoutEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../utils/auth';
import { Orbitron } from 'next/font/google';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';
import GlobalLoading from '../components/GlobalLoading';

const chatMessages = [
  '今日は何のお話をする？✨',
  '久しぶり！また会えたね💕',
  'どんな一日だった？🌟',
  '一緒に遊びたいな🎮',
  'お話ししようよ💭',
  'また会えて嬉しい💖',
  '今日も楽しく過ごそう🌈',
  'あなたのことが大好き💝',
];

const orbitron = Orbitron({ weight: '700', subsets: ['latin'] });

const videoFiles = [
  '/videos/hero-videos_01.mp4',
  '/videos/hero-videos_02.mp4',
  '/videos/hero-videos_03.mp4',
];

export default function Home({ params }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);
  const currentIndexRef = useRef(0);
  const activeVideoRef = useRef(1);
  const [videoDurations, setVideoDurations] = useState({});
  const [isFading, setIsFading] = useState(false);
  const [nextVideoIndex, setNextVideoIndex] = useState(null);
  const videoRef = useRef(null);
  const [arrowHover, setArrowHover] = useState(false);
  const [chatIndex, setChatIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const typingTimeout = useRef(null);
  const fadeTimeout = useRef(null);
  const titleRef = useRef(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0, width: 0 });
  const bubbleRef = useRef(null);
  const [bubbleWidth, setBubbleWidth] = useState(0);
  const bubbleOffset = 80; // px, how much to offset left/right
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(false);
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [leftMessageIndex, setLeftMessageIndex] = useState(0);
  const [rightMessageIndex, setRightMessageIndex] = useState(1);
  const leftMessage = chatMessages[leftMessageIndex];
  const rightMessage = chatMessages[rightMessageIndex];
  const t = useTranslations('app');
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.hasCompletedSetup) {
          router.push(`/${locale}/dashboard`);
        } else {
          router.push(`/${locale}/setup`);
        }
      }
    }
  }, [user, loading, router, locale]);
  
  useEffect(() => {
    const loadVideoDuration = (videoElement, index) => {
      if (videoElement && !videoDurations[index]) {
        videoElement.addEventListener('loadedmetadata', () => {
          console.log(`動画${index + 1}の長さ:`, videoElement.duration, '秒');
          setVideoDurations(prev => ({
            ...prev,
            [index]: videoElement.duration
          }));
        });
      }
    };

    if (videoRef1.current) {
      loadVideoDuration(videoRef1.current, currentVideoIndex);
    }
    if (videoRef2.current) {
      loadVideoDuration(videoRef2.current, (currentVideoIndex + 1) % videoFiles.length);
    }
  }, [currentVideoIndex, videoDurations]);
  
  const switchToNextVideo = useCallback(() => {
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
      timeoutRef.current = setTimeout(switchToNextVideo, 7000);
    }, 2000);
  }, [isTransitioning]);

  useEffect(() => {
    currentIndexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

  useEffect(() => {
    timeoutRef.current = setTimeout(switchToNextVideo, 7000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [switchToNextVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        console.log('Video loaded successfully');
      });
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
      });
    }
  }, []);
  
  useEffect(() => {
    setDisplayedText('');
    if (!bubbleVisible) return;
    let i = 0;
    function type() {
      setDisplayedText(chatMessages[chatIndex].slice(0, i + 1));
      if (i < chatMessages[chatIndex].length - 1) {
        typingTimeout.current = setTimeout(() => {
          i++;
          type();
        }, 50);
      }
    }
    type();
    return () => clearTimeout(typingTimeout.current);
  }, [chatIndex, bubbleVisible]);

  useEffect(() => {
    setBubbleVisible(true);
    fadeTimeout.current = setTimeout(() => {
      setBubbleVisible(false);
      setTimeout(() => {
        setChatIndex((prev) => (prev + 1) % chatMessages.length);
        setBubbleVisible(true);
      }, 600); // fade out duration
    }, 2500 + chatMessages[chatIndex].length * 50); // show time + typing time
    return () => clearTimeout(fadeTimeout.current);
  }, [chatIndex]);
  
  useLayoutEffect(() => {
    function updateBubblePos() {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        setBubblePos({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    }
    updateBubblePos();
    window.addEventListener('resize', updateBubblePos);
    return () => window.removeEventListener('resize', updateBubblePos);
  }, []);

  useEffect(() => {
    if (bubbleRef.current) {
      setBubbleWidth(bubbleRef.current.offsetWidth);
    }
  }, [displayedText]);
  
  useEffect(() => {
    let isLeft = true;
    let currentIndex = 0;
    let leftTimeout, rightTimeout;

    function showLeft() {
      setLeftText('');
      setLeftVisible(true);
      setRightVisible(false);
      let i = 0;
      function type() {
        setLeftText(chatMessages[currentIndex].slice(0, i + 1));
        if (i < chatMessages[currentIndex].length - 1) {
          leftTimeout = setTimeout(() => {
            i++;
            type();
          }, 100);
        }
      }
      type();
      leftTimeout = setTimeout(() => {
        setLeftVisible(false);
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % chatMessages.length;
          showRight();
        }, 600); // フェードアウト後
      }, 2500 + chatMessages[currentIndex].length * 100);
    }

    function showRight() {
      setRightText('');
      setLeftVisible(false);
      setRightVisible(true);
      let i = 0;
      function type() {
        setRightText(chatMessages[currentIndex].slice(0, i + 1));
        if (i < chatMessages[currentIndex].length - 1) {
          rightTimeout = setTimeout(() => {
            i++;
            type();
          }, 100);
        }
      }
      type();
      rightTimeout = setTimeout(() => {
        setRightVisible(false);
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % chatMessages.length;
          showLeft();
        }, 600);
      }, 2500 + chatMessages[currentIndex].length * 100);
    }

    showLeft();
    return () => {
      clearTimeout(leftTimeout);
      clearTimeout(rightTimeout);
    };
  }, []);
  
  if (loading) {
    return <GlobalLoading text={t('loading', '読み込み中...')} />;
  }
  
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
      <div className={`container ${styles['home-container']}`}> 
        <div className={styles['home-wrapper']}>
          <div className={styles['home-title-area']}>
            <div className={styles['home-title-block']}>
              <div className={styles['home-logo']}>キャラクティア</div>
              <h1 className={`${orbitron.className} ${styles.title}`} ref={titleRef}>
                {t('title')}
              </h1>
              {/* 左右の吹き出し */}
              <div
                className={
                  `${styles['chat-bubble']} ${styles.left} ${leftVisible ? styles.show : styles.hide}`
                }
              >
                {leftText || '\u00A0'}
              </div>
              <div
                className={
                  `${styles['chat-bubble']} ${styles.right} ${rightVisible ? styles.show : styles.hide}`
                }
              >
                {rightText || '\u00A0'}
              </div>
            </div>
            <p className={styles.subtitle}>
              会いにきて...あなただけの愛(AI）。
            </p>
          </div>
          <p className={styles['description']}>
            Charactier（キャラクティア）は、あなた専用の<br />AIキャラクターと、毎日話したり気持ちを共有できる体験です。
          </p>
          <div className={styles['home-btn-wrap']}>
            <Link
              href={`/${locale}/login`}
              className={`${orbitron.className} button ${styles['home-login-btn']}`}
              onMouseEnter={() => setArrowHover(true)}
              onMouseLeave={() => setArrowHover(false)}
            >
              <span className={styles['home-login-btn-text']}>{t('login')}</span>
              <span className={styles['home-login-btn-icon']}>
                {/* Arrow SVG */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`${styles['arrow-svg']}${arrowHover ? ' ' + styles['arrow-hide'] : ''}`}
                >
                  <path d="M9 6L15 12L9 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Heart SVG (img) */}
                <img
                  src="/images/heart.svg"
                  alt="ハート"
                  className={`${styles['heart-svg']}${arrowHover ? ' ' + styles['heart-show'] : ''}`}
                />
              </span>
            </Link>
            <div className={styles['home-register-link-wrap']}>
              <Link href={`/${locale}/register`} className="register-link">
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
