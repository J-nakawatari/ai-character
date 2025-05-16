'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import Button from '../components/Button';
import ChatMessage from '../components/ChatMessage';

export default function Chat() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.hasCompletedSetup) {
        router.push('/setup');
      }
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.selectedCharacter) {
        try {
          const res = await api.get(`/chat?characterId=${user.selectedCharacter._id}`);
          setMessages(res.data.messages || []);
          setChatId(res.data._id);
        } catch (err) {
          setError('Failed to load chat history');
          console.error(err);
        }
      }
    };
    
    if (!loading && user) {
      loadChatHistory();
    }
  }, [loading, user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
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
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (

    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">AI Character Chat</h1>
main
          <Button onClick={handleLogout}>ログアウト</Button>
        </div>
      </header>
      

      <main className="chat-main">
        {/* Character info */}
        <div className="chat-character-info">
          <div className="chat-character-avatar">
main
            {user.selectedCharacter?.imageUrl ? (
              <Image
                src={user.selectedCharacter.imageUrl}
                alt={user.selectedCharacter.name}

                width={64}
                height={64}
                className="object-cover rounded-full"
                priority
main
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl">
                {user.selectedCharacter?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <div className="chat-character-details">
            <h2 className="chat-character-name">{user.selectedCharacter?.name || 'AI Character'}</h2>
            <p className="chat-character-personality">{user.selectedCharacter?.personality}</p>
 main
          </div>
        </div>
        
        {/* Chat messages */}

        <div className="chat-messages-container">
          <div className="chat-messages-list">
            {messages.length === 0 ? (
              <div className="chat-welcome">
main
                <p>{`${user.name}さん、おかえりなさい！ チャットを始めましょう。`}</p>
              </div>
            ) : (
              <div>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg}
                    isUser={msg.sender === 'user'}
                  />
                ))}
                {isTyping && (

                  <div className="chat-typing">
                    <div className="chat-typing-bubble">
                      <div className="chat-typing-dots">
                        <span className="chat-typing-dot"></span>
                        <span className="chat-typing-dot"></span>
                        <span className="chat-typing-dot"></span>
                      </div>
main
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message input */}

          <form onSubmit={handleSendMessage} className="chat-input-container">
            {error && (
              <div className="chat-input-error">
                {error}
              </div>
            )}
            <div className="chat-input-form">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                  className="chat-input"
                  ref={inputRef}
                />
                <Button
                  type="submit"
                  className="chat-send-button"
                  disabled={isTyping || !message.trim()}
                >
                  送信
                </Button>
              </div>
              <p className="chat-input-help">
                送信: Enter  |  改行: Shift + Enter
              </p>
            </div>
main
          </form>
        </div>
      </main>
    </div>
  );
}
