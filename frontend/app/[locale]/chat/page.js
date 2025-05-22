'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';
import Button from '../../components/Button';
import ChatMessage from '../../components/ChatMessage';
import '../../styles/chat.css';
import { useTranslations } from 'next-intl';
// モックデータをインポート
import { mockCharacters, mockUser } from '../../utils/mockData';

export default function Chat({ params }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = typeof params.then === 'function' ? use(params) : params;
  const t = useTranslations('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  
  // モックユーザーデータを作成
  const mockUserWithCharacter = {
    ...mockUser,
    hasCompletedSetup: true,
    selectedCharacter: mockCharacters[0] // 最初のキャラクターを選択したと仮定
  };
  
  // 実際のユーザーデータがある場合はそれを使用し、なければモックデータを使用
  const displayUser = user || mockUserWithCharacter;
  
  useEffect(() => {
    const loadChatHistory = async () => {
      if (displayUser?.selectedCharacter?._id) {
        try {
          // APIコールの代わりにモックメッセージを使用
          const mockMessages = [
            {
              sender: 'ai',
              content: `こんにちは、${displayUser.name}さん！私は${displayUser.selectedCharacter.name.ja || displayUser.selectedCharacter.name}です。何かお手伝いできることはありますか？`,
              timestamp: new Date(Date.now() - 60000).toISOString()
            }
          ];
          setMessages(mockMessages);
          setChatId('mock-chat-id');
          setError('');
        } catch (err) {
          setError(t('failed_load_history', 'チャット履歴の読み込みに失敗しました'));
          console.error('Failed to load chat history:', err);
        }
      } else if (displayUser?.selectedCharacter) {
        console.error('selectedCharacter exists but _id is missing:', displayUser.selectedCharacter);
        setError(t('incomplete_character_data', 'キャラクターデータが不完全です。再読み込みしてください'));
      }
    };
    
    if (!loading) {
      loadChatHistory();
    }
  }, [loading, displayUser, t]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    let animationId;
    let particles = [];
    let ctx, width, height, canvas;

    function setupCanvas() {
      canvas = canvasRef.current;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      const PARTICLE_NUM = 40;
      for (let i = 0; i < PARTICLE_NUM; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 60 + Math.random() * 40,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          alpha: 0.08 + Math.random() * 0.08,
          color: `hsl(${Math.random() * 360}, 70%, 85%)`
        });
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 40;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;
      }
      animationId = requestAnimationFrame(draw);
    }

    function handleResize() {
      setupCanvas();
    }

    setupCanvas();
    draw();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [pathname]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      const userMessage = {
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);
      
      // APIコールの代わりにモックレスポンスを使用
      setTimeout(() => {
        setIsTyping(false);
        
        const aiMessage = {
          sender: 'ai',
          content: `${message.trim()}についてですね。もう少し詳しく教えていただけますか？`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
      
    } catch (err) {
      setError(t('failed_send', 'メッセージの送信に失敗しました'));
      setIsTyping(false);
      console.error(err);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
    }
  };
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push(`/${locale}/login`);
    }
  };
  
  // ローディング中またはユーザーデータがない場合はローディング表示
  // モックデータを使用するため、常にモックユーザーデータを表示する
  if (false) { // 常にfalseになるようにして、ローディング表示をスキップ
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('loading', 'Loading...')}</p>
      </div>
    );
  }
  
  // キャラクター名を取得（オブジェクトの場合はロケールに合わせて表示）
  const getCharacterName = () => {
    const character = displayUser.selectedCharacter;
    if (!character) return '';
    
    if (typeof character.name === 'object') {
      return character.name[locale] || character.name.ja || character.name.en || '';
    }
    return character.name || '';
  };
  
  return (
    <div className="chat-container">
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}></canvas>
      
      <button 
        className="chat-back-button" 
        onClick={() => router.push(`/${locale}/dashboard`)}
        aria-label={t('back', '戻る')}
      >
        <span>←</span>
      </button>
      
      <header className="chat-header">
        <h1 className="chat-header-title">{getCharacterName() || 'AI Character'}</h1>
        <button 
          onClick={handleLogout} 
          className="button button--secondary button--sm"
        >
          {t('logout', 'ログアウト')}
        </button>
      </header>
      
      <main className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <p>{t('welcome_message', `${displayUser.name}さん、おかえりなさい！ チャットを始めましょう。`)}</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.sender === 'user' ? 'chat-message--user' : 'chat-message--ai'}`}
                >
                  {msg.sender === 'ai' && displayUser.selectedCharacter?.imageCharacterSelect && (
                    <div className="chat-message-avatar">
                      <img
                        src={displayUser.selectedCharacter.imageCharacterSelect}
                        alt={getCharacterName()}
                        width={40}
                        height={40}
                      />
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai'}`}>
                    <span className="chat-bubble-text">{msg.content}</span>
                    <span className="chat-bubble-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-typing">
                  <div className="chat-typing-bubble">
                    <div className="chat-typing-dots">
                      <span className="chat-typing-dot"></span>
                      <span className="chat-typing-dot"></span>
                      <span className="chat-typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-container">
          {error && (
            <div className="chat-input-error">
              {error}
            </div>
          )}
          <div className="chat-input-form">
            <div className="chat-input-wrapper">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('input_placeholder', 'メッセージを入力...')}
                className="chat-input"
                ref={inputRef}
                rows={1}
              />
              <button
                type="submit"
                className="chat-send-button"
                disabled={isTyping || !message.trim()}
                onClick={handleSendMessage}
              >
                {t('send', '送信')}
              </button>
            </div>
            <p className="chat-input-help">
              {t('input_help', '送信: Enter  |  改行: Shift + Enter')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
