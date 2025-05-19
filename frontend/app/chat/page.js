'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import ChatMessage from '../components/ChatMessage';
import BackButton from '../components/BackButton';

export default function Chat() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.hasCompletedSetup) {
      router.push('/setup');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const res = await api.get(`/chat?characterId=${user.selectedCharacter._id}`);
          setMessages(res.data.messages || []);
          setChatId(res.data._id);
          setError(''); // Clear any previous errors
        } catch (err) {
          setError('Failed to load chat history');
          console.error('Failed to load chat history:', err);
        }
      } else if (user?.selectedCharacter) {
        console.error('selectedCharacter exists but _id is missing:', user.selectedCharacter);
        setError('Character data is incomplete, please refresh');
      }
    };
    
    if (!loading && user) {
      loadChatHistory();
    }
  }, [loading, user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    // パーティクル設定
    const particles = [];
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

    function draw() {
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
    draw();

    return () => {
      window.removeEventListener('resize', resize);
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
      
      const res = await api.post('/chat', {
        characterId: user.selectedCharacter._id,
        message: message.trim()
      });
      
      setTimeout(() => {
        setIsTyping(false);
        
        const aiMessage = {
          sender: 'ai',
          content: res.data.reply,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
      
    } catch (err) {
      setError('Failed to send message');
      setIsTyping(false);
      console.error(err);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  if (loading || !user) {
    return (
      <div className="chat">
        <div className="chat__loading">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat">
      <canvas ref={canvasRef} className="chat__bg-canvas"></canvas>
      <BackButton to="/dashboard" />
      
      <header className="chat__header">
        <div className="chat__header-content">
          <h1 className="chat__title">{user.selectedCharacter?.name || 'AI Character'}</h1>
          <div className="chat__nav">
            <button 
              onClick={logout} 
              className="button button--secondary button--sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>
      
      <main className="chat__main">
        <div className="chat__messages-container">
          {user.selectedCharacter?.imageChatBackground && (
            <div className="chat__character-background">
              <img
                src={user.selectedCharacter.imageChatBackground}
                alt="背景キャラクター"
                className="chat__character-bg-image"
              />
            </div>
          )}
          
          <div className="chat__messages-list">
            {messages.length === 0 ? (
              <div className="chat__welcome">
                <p>{`${user.name}さん、おかえりなさい！ チャットを始めましょう。`}</p>
              </div>
            ) : (
              <div>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg}
                    isUser={msg.sender === 'user'}
                    characterImageUrl={user.selectedCharacter?.imageChatAvatar}
                  />
                ))}
                {isTyping && (
                  <div className="chat-message chat-message--ai">
                    <div className="chat-message__avatar">
                      <Image 
                        src={user.selectedCharacter?.imageChatAvatar || '/images/default-avatar.png'} 
                        alt="Character" 
                        width={40} 
                        height={40} 
                        className="chat-message__avatar-img" 
                      />
                    </div>
                    <div className="chat-message__bubble chat-message__bubble--typing">
                      <div className="chat-typing-dots">
                        <div className="chat-typing-dot"></div>
                        <div className="chat-typing-dot"></div>
                        <div className="chat-typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="chat__input-container">
            {error && (
              <div className="chat__input-error">
                {error}
              </div>
            )}
            <div className="chat__input-form">
              <div className="chat__input-wrapper">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                  className="chat__input"
                  ref={inputRef}
                  rows={1}
                />
                <button
                  type="submit"
                  className="chat__send-button"
                  disabled={isTyping || !message.trim()}
                  onClick={handleSendMessage}
                >
                  送信
                </button>
              </div>
              <p className="chat__input-help">
                送信: Enter  |  改行: Shift + Enter
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
