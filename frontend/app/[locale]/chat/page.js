'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import useRequireAuth from '../../utils/useRequireAuth';
import { apiGet, apiPost } from '../../utils/api';
import Button from '../../components/Button';
import ChatMessage from '../../components/ChatMessage';
import AffinityInfo from '../../components/AffinityInfo';
import '../../styles/chat.css';
import { useTranslations } from 'next-intl';
import GlobalLoading from '../../components/GlobalLoading';
import ErrorMessage from '../../components/ErrorMessage';

// HEX→RGBA変換関数
function hexToRgba(hex, alpha = 0.1) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

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
  const [affinityData, setAffinityData] = useState(null);
  const [remainingChats, setRemainingChats] = useState(null);
  const [chatLimitReached, setChatLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  
  // チャット制限状態をリロードする関数
  const reloadChatLimitStatus = useCallback(async () => {
    if (user?.selectedCharacter?._id && user?.membershipType === 'free') {
      try {
        const res = await apiGet(`/chat?characterId=${user.selectedCharacter._id}`);
        if (res.success) {
          setChatLimitReached(res.data.isLimitReached || false);
          setRemainingChats(res.data.remainingChats || null);
        }
      } catch (err) {
        console.error('Failed to reload chat limit status:', err);
      }
    }
  }, [user?.selectedCharacter?._id, user?.membershipType]);
  
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const res = await apiGet(`/chat?characterId=${user.selectedCharacter._id}`);
          if (res.success) {
            const historyMessages = res.data.messages || [];
            setMessages(historyMessages);
            setChatId(res.data._id);
            
            // チャット制限状態を設定
            if (res.data.isLimitReached !== undefined) {
              setChatLimitReached(res.data.isLimitReached);
            }
            if (res.data.remainingChats !== undefined) {
              setRemainingChats(res.data.remainingChats);
            }
            
            // 制限メッセージをチェック（制限に達している場合、メッセージ履歴の最後にあるかも）
            if (res.data.isLimitReached && historyMessages.length > 0) {
              const lastMessage = historyMessages[historyMessages.length - 1];
              if (lastMessage.isLimitMessage && lastMessage.content) {
                setLimitMessage(lastMessage.content);
              }
            }
            
            if (historyMessages.length === 0 && user.selectedCharacter.defaultMessage) {
              const defaultMessage = {
                sender: 'ai',
                content: user.selectedCharacter.defaultMessage[locale] || user.selectedCharacter.defaultMessage.ja || user.selectedCharacter.defaultMessage.en,
                timestamp: new Date().toISOString()
              };
              setMessages([defaultMessage]);
            }
            setError('');
          } else {
            setError(t('failed_load_history', 'チャット履歴の読み込みに失敗しました'));
            console.error('Failed to load chat history:', res.error);
          }
        } catch (err) {
          setError(t('failed_load_history', 'チャット履歴の読み込みに失敗しました'));
          console.error('Failed to load chat history:', err);
        }
      } else if (user?.selectedCharacter) {
        console.error('selectedCharacter exists but _id is missing:', user.selectedCharacter);
        setError(t('incomplete_character_data', 'キャラクターデータが不完全です。再読み込みしてください'));
      }
    };
    
    const loadAffinityData = async () => {
      if (user?.selectedCharacter?._id) {
        try {
          const affinityRes = await apiGet(`/users/me/affinity/${user.selectedCharacter._id}`);
          if (affinityRes.success) {
            setAffinityData(affinityRes.data);
          }
        } catch (err) {
          console.error('Failed to load affinity data:', err);
        }
      }
    };
    
    if (!loading && user) {
      loadChatHistory();
      loadAffinityData();
    }
  }, [loading, user, t, locale]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 定期的にチャット制限状態をチェック（無料会員のみ）
  useEffect(() => {
    if (user?.membershipType !== 'free') return;
    
    // 初回は短いインターバルで頻繁にチェック（管理者のリセット操作を早期検出）
    const shortInterval = setInterval(() => {
      reloadChatLimitStatus();
    }, 5000); // 5秒ごと
    
    // 60秒後に長いインターバルに切り替え
    const longIntervalTimeout = setTimeout(() => {
      clearInterval(shortInterval);
      const longInterval = setInterval(() => {
        reloadChatLimitStatus();
      }, 30000); // 30秒ごと
      
      return () => clearInterval(longInterval);
    }, 60000);
    
    return () => {
      clearInterval(shortInterval);
      clearTimeout(longIntervalTimeout);
    };
  }, [user?.membershipType, reloadChatLimitStatus]);
  
  // ウィンドウフォーカス時にチャット制限状態を再チェック
  useEffect(() => {
    if (user?.membershipType !== 'free') return;
    
    const handleFocus = () => {
      reloadChatLimitStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.membershipType, reloadChatLimitStatus]);
  
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
      
      const res = await apiPost('/chat', {
        characterId: user.selectedCharacter._id,
        message: message.trim()
      });
      
      if (res.success) {
        setTimeout(() => {
          setIsTyping(false);
          
          const aiMessage = {
            sender: 'ai',
            content: res.data.reply,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // 残りチャット回数を更新
          if (res.data.remainingChats !== null) {
            setRemainingChats(res.data.remainingChats);
          }
        }, 1000);
      } else {
        setIsTyping(false);
        
        // チャット制限に達した場合の特別処理
        if (res.error && res.error.isLimitReached) {
          setChatLimitReached(true);
          setLimitMessage(res.error.msg || 'チャット制限に達しました');
          setError(res.error.msg || 'チャット制限に達しました');
        } else {
          setError(t('failed_send', 'メッセージの送信に失敗しました'));
        }
        console.error(res.error);
      }
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
  
  // テーマカラー取得
  const themeColor = user.selectedCharacter?.themeColor || '#75C6D1';
  const chatMainBg = hexToRgba(themeColor, 0.1);
  const userBubbleBg = hexToRgba(themeColor, 0.3);

  return (
    <div className="chat-container" style={{ '--theme-color': themeColor, '--user-bubble-bg': userBubbleBg, position: 'relative' }}>
      {/* チャットヘッダー */}
      <div className="chat-header">
        <div className="chat-header-character-info">
          {user.selectedCharacter?.imageChatAvatar && (
            <img
              src={user.selectedCharacter.imageChatAvatar}
              alt={typeof user.selectedCharacter.name === 'object' 
                ? (user.selectedCharacter.name[locale] || user.selectedCharacter.name.ja || user.selectedCharacter.name.en || 'AI Character') 
                : (user.selectedCharacter.name || 'AI Character')}
              className="chat-header-avatar"
            />
          )}
          <div className="chat-header-details">
            <h1 className="chat-header-title">
              {typeof user.selectedCharacter?.name === 'object'
                ? (user.selectedCharacter.name[locale] || user.selectedCharacter.name.ja || user.selectedCharacter.name.en || 'AIキャラクター')
                : (user.selectedCharacter?.name || 'AIキャラクター')}
            </h1>
            {affinityData && (
              <div className="chat-header-affinity">
                <AffinityInfo 
                  level={affinityData.level} 
                  description={affinityData.description}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="chat-main" style={{ background: chatMainBg }}>
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
                    <div className="chat-message-content">
                      {msg.sender === 'ai' && (
                        <div className="chat-character-name">
                          {typeof user.selectedCharacter.name === 'object'
                            ? (user.selectedCharacter.name[locale] || user.selectedCharacter.name.ja || user.selectedCharacter.name.en || 'AIキャラクター')
                            : (user.selectedCharacter.name || 'AIキャラクター')}
                        </div>
                      )}
                      <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai'}`}>
                        <span className="chat-bubble-text">{msg.content}</span>
                        <span className="chat-bubble-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
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
          {/* チャット制限メッセージ */}
          {chatLimitReached && (
            <div className="chat-limit-message">
              <div className="chat-limit-content">
                <div className="chat-limit-icon">😅</div>
                <h3 className="chat-limit-title">1日の無料チャット回数に達しました</h3>
                {limitMessage ? (
                  <p>{limitMessage}</p>
                ) : (
                  <>
                    <p>プレミアム会員になると、もっとたくさん会話ができます。</p>
                    <p>いつでもキャラクターと無制限でお話しできるように、ぜひプレミアム会員をご検討ください！</p>
                  </>
                )}
                <button 
                  className="chat-upgrade-button"
                  onClick={() => router.push(`/${locale}/purchase`)}
                >
                  🌟 プレミアム会員になる
                </button>
              </div>
            </div>
          )}
          
          {/* 残りチャット回数表示（無料会員のみ） */}
          {!chatLimitReached && user?.membershipType === 'free' && remainingChats !== null && (
            <div className="chat-remaining-counter">
              💬 今日あと <strong>{remainingChats}</strong> 回チャットできます
              {remainingChats <= 2 && (
                <span className="chat-remaining-warning"> • プレミアム会員で無制限に！</span>
              )}
            </div>
          )}
          
          <div className="chat-input-form">
            <div className="chat-input-wrapper">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatLimitReached ? 'チャット制限に達しました' : t('input_placeholder', 'メッセージを入力...')}
                className="chat-input"
                ref={inputRef}
                rows={1}
                disabled={chatLimitReached}
              />
              <button
                type="submit"
                className="chat-send-button"
                disabled={isTyping || !message.trim() || chatLimitReached}
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
