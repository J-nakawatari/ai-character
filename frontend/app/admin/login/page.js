'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../utils/adminAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { admin, loading, adminLogin } = useAdminAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && admin) {
      router.push('/admin/dashboard');
    }
  }, [admin, loading, router]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await adminLogin(formData);
      
      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('ログイン処理中にエラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="background-container">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-[#000000] to-[#1a1a2e] opacity-90 z-0"></div>
      </div>
      <div className="overlay"></div>
      
      <Card className="w-full max-w-md z-10 backdrop-blur-sm bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#43eafc] to-[#fa7be6] text-transparent bg-clip-text font-['M_PLUS_Rounded_1c']">管理者ログイン</h1>
        
        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="メールアドレス"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <Input
            label="パスワード"
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
