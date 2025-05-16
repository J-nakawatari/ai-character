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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Character Chat</h1>
          <Button onClick={handleLogout}>ログアウト</Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
        {/* Character info */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 relative overflow-hidden rounded-full bg-gray-200 mr-4">
            {user.selectedCharacter?.imageUrl ? (
              <Image
                src={user.selectedCharacter.imageUrl}
                alt={user.selectedCharacter.name}
                width={64}
                height={64}
                className="object-cover rounded-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl">
                {user.selectedCharacter?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-medium">{user.selectedCharacter?.name || 'AI Character'}</h2>
            <p className="text-sm text-gray-600">{user.selectedCharacter?.personality}</p>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400">
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
                  <div className="flex mb-4">
                    <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                      <p>...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            {error && (
              <div className="mb-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                {error}
              </div>
            )}
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力..."
                className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={inputRef}
              />
              <Button
                type="submit"
                className="rounded-l-none px-4"
                disabled={isTyping || !message.trim()}
              >
                送信
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              送信: Enter  |  改行: Shift + Enter
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
