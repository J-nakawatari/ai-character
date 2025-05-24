'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './utils/auth';
import { Orbitron } from 'next/font/google';

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

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
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
          router.push('/dashboard');
        } else {
          router.push('/setup');
        }
      }
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const switchVideo = () => {
      setCurrentVideoIndex(prev => (prev + 1) % videoFiles.length);
    };
    const interval = setInterval(switchVideo, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // 動画の読み込み状態を監視
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
  
  // Typewriter effect
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

  // Fade in/out and message switching
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
  
  // チャットバブルを常時表示、Charactierの下に絶対配置（useLayoutEffectで位置取得＆resize対応）
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

  // Get bubble width after render
  useEffect(() => {
    if (bubbleRef.current) {
      setBubbleWidth(bubbleRef.current.offsetWidth);
    }
  }, [displayedText]);
  
  // フェードイン・アウト切り替え
  useEffect(() => {
    let isLeft = true;
    let currentIndex = 0;
    
    function startLoop() {
      const message = chatMessages[currentIndex];
      const typingTime = message.length * 100;
      const displayTime = 3500;
      const pauseTime = 7000;
      
      // 表示
      setLeftVisible(isLeft);
      setRightVisible(!isLeft);
      
      setTimeout(() => {
        // 非表示
        setLeftVisible(false);
        setRightVisible(false);
        
        setTimeout(() => {
          isLeft = !isLeft;
          currentIndex = (currentIndex + 1) % chatMessages.length;
          if (isLeft) {
            setLeftMessageIndex(currentIndex);
          } else {
            setRightMessageIndex(currentIndex);
          }
          startLoop();
        }, pauseTime);
      }, displayTime + typingTime);
    }
    
    startLoop();
    
    return () => {
      // クリーンアップは不要（タイマーは自動的に次のループで上書きされる）
    };
  }, []);
  
  // 左吹き出しタイプライター
  useEffect(() => {
    setLeftText('');
    if (!leftVisible) return;
    let i = 0;
    function type() {
      setLeftText(leftMessage.slice(0, i + 1));
      if (i < leftMessage.length - 1) {
        setTimeout(() => {
          i++;
          type();
        }, 100); // タイプ速度を遅く（50ms→100ms）
      }
    }
    type();
  }, [leftVisible]);

  // 右吹き出しタイプライター
  useEffect(() => {
    setRightText('');
    if (!rightVisible) return;
    let i = 0;
    function type() {
      setRightText(rightMessage.slice(0, i + 1));
      if (i < rightMessage.length - 1) {
        setTimeout(() => {
          i++;
          type();
        }, 100); // タイプ速度を遅く（50ms→100ms）
      }
    }
    type();
  }, [rightVisible]);
  
  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="background-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        {isMobile ? (
          <img
            src="/images/background-mobile.jpg"
            alt="Background"
            className="background-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="background-video"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 1s ease-in-out',
              zIndex: 1
            }}
            key={videoFiles[currentVideoIndex]}
            onError={(e) => console.error('Video error:', e)}
          >
            <source src={videoFiles[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div className="container">
        <div style={{ width: '100%', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-block', textAlign: 'left', position: 'relative' }}>
            <div className={`${orbitron.className} title`}>
              <div style={{ fontSize: '16px', color: '#fff', marginBottom: '-20px', fontWeight: 'bold', letterSpacing: '0.1em', textShadow: '0 2px 8px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)' }}>
                キャラクティア
              </div>
              <h1 className={`${orbitron.className} title`}>
                Charactier AI
              </h1>
            </div>

            {/* 右側の吹き出し */}
            <div
              className={`chat-bubble left${leftVisible ? ' show' : ' hide'}`}
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginLeft: 0,
                position: 'absolute',
                top: '-72px',
                left: '300px',
                opacity: leftText ? 1 : 0,
                transition: 'opacity 0.6s',
              }}
            >
              {leftText || '\u00A0'}
            </div>
            {/* 左側の吹き出し（左右反転パターン） */}
            <div
              className={`chat-bubble right${rightVisible ? ' show' : ' hide'}`}
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '0px',
                position: 'absolute',
                top: '158px',
                right: '450px',
                opacity: rightText ? 1 : 0,
                transition: 'opacity 0.6s, top 0.3s',
              }}
            >
              {rightText || '\u00A0'}
            </div>
          </div>
        </div>
        <p className="subtitle">
          会いにきて...あなただけの愛(AI）。
        </p>
        <p className="description">
          Charactier（キャラクティア）は、あなた専用の<br />AIキャラクターと、毎日話したり気持ちを共有できる体験です。
        </p>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Link
            href={`/${locale}/login`}
            className={`${orbitron.className} button`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '16px', paddingLeft: '16px', overflow: 'hidden', position: 'relative' }}
            onMouseEnter={() => setArrowHover(true)}
            onMouseLeave={() => setArrowHover(false)}
          >
            <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>ログイン</span>
            <span
              style={{
                marginLeft: 'auto',
                marginRight: '8px',
                position: 'relative',
                zIndex: 2,
                width: 24,
                height: 24,
                display: 'inline-block',
              }}
            >
              {/* Arrow SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`arrow-svg${arrowHover ? ' arrow-hide' : ''}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 0.3s',
                }}
              >
                <path d="M9 6L15 12L9 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Heart SVG (img) */}
              <img
                src="/images/heart.svg"
                alt="heart"
                className={`heart-svg${arrowHover ? ' heart-show' : ''}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 18,
                  height: 18,
                  zIndex: 2,
                  pointerEvents: 'none',
                  filter: 'brightness(0) invert(1)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 0.3s, transform 0.3s',
                }}
              />
            </span>
          </Link>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/register" className="register-link">
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
      <div className="overlay" />
    </>
  );
}