'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../utils/adminAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import '../../globals.css';

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
      <div className="min-h-screen flex items-center justify-center text-gray-800">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <Card className="w-full max-w-md shadow-[0_8px_32px_rgba(67,234,252,0.15),0_4px_16px_rgba(250,123,230,0.1)]">
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#43eafc] to-[#fa7be6] text-transparent bg-clip-text font-['M_PLUS_Rounded_1c']">管理者ログイン</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="text-gray-800">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md text-gray-800 border-gray-300"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md text-gray-800 border-gray-300"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
