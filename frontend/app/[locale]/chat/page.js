'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import useRequireAuth from '../../utils/useRequireAuth';
import api from '../../utils/api';
import Button from '../../components/Button';
import ChatMessage from '../../components/ChatMessage';
import '../../styles/chat.css';
import { useTranslations } from 'next-intl';
import GlobalLoading from '../../components/GlobalLoading';
import ErrorMessage from '../../components/ErrorMessage';

export default function Chat({ params }) {
  const { user, loading, element } = useRequireAuth();
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
  
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const res = await api.get(`/chat?characterId=${user.selectedCharacter._id}`);
          const historyMessages = res.data.messages || [];
          setMessages(historyMessages);
          setChatId(res.data._id);

          if (historyMessages.length === 0 && user.selectedCharacter.defaultMessage) {
            const defaultMessage = {
              sender: 'ai',
              content: user.selectedCharacter.defaultMessage[locale] || user.selectedCharacter.defaultMessage.ja || user.selectedCharacter.defaultMessage.en,
              timestamp: new Date().toISOString()
            };
            setMessages([defaultMessage]);
          }
          setError('');
        } catch (err) {
          setError(t('failed_load_history', 'チャット履歴の読み込みに失敗しました'));
          console.error('Failed to load chat history:', err);
        }
      } else if (user?.selectedCharacter) {
        console.error('selectedCharacter exists but _id is missing:', user.selectedCharacter);
        setError(t('incomplete_character_data', 'キャラクターデータが不完全です。再読み込みしてください'));
      }
    };
    
    if (!loading && user) {
      loadChatHistory();
    }
  }, [loading, user, t, locale]);
  
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
  
  if (element) return element;
  if (!user) return null;
  
  return (
    <div className="chat-container">
      <main className="chat-main">
        {error && (
          <ErrorMessage
            message={error}
            type="toast"
            className="chat-error-message"
          />
        )}
        {user.selectedCharacter?.imageChatBackground && (
          <img
            src={user.selectedCharacter.imageChatBackground}
            alt="背景"
            className="chat-bg-character-image"
          />
        )}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <p>{t('welcome_message', `${user.name}さん、おかえりなさい！ チャットを始めましょう。`)}</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.sender === 'user' ? 'chat-message--user' : 'chat-message--ai'}`}
                >
                  {msg.sender === 'ai' && user.selectedCharacter?.imageChatAvatar && (
                    <div className="chat-message-avatar">
                      <img
                        src={user.selectedCharacter.imageChatAvatar}
                        alt={typeof user.selectedCharacter.name === 'object' ? (user.selectedCharacter.name[locale] || user.selectedCharacter.name.ja || user.selectedCharacter.name.en || 'AI Character') : (user.selectedCharacter.name || 'AI Character')}
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
