'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

export default function NewCharacter() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personalityPrompt: '',
    isPremium: false,
    price: 0,
    purchaseType: 'buy',
    isLimited: false,
    voice: '',
    defaultMessage: '',
    themeColor: '#000000',
    isActive: true
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.id]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/admin/characters', formData);
      router.push(`/admin/characters/${res.data._id}/edit`);
    } catch (err) {
      console.error('キャラクター作成に失敗:', err);
      setError(err.response?.data?.msg || 'キャラクター作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規キャラクター作成</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              
              <Input
                label="キャラクター名"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  説明文
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                  rows={4}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="personalityPrompt" className="block text-sm font-medium mb-1">
                  AIに渡す人格プロンプト
                </label>
                <textarea
                  id="personalityPrompt"
                  value={formData.personalityPrompt}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                  rows={4}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="defaultMessage" className="block text-sm font-medium mb-1">
                  初回ログイン時のあいさつメッセージ
                </label>
                <textarea
                  id="defaultMessage"
                  value={formData.defaultMessage}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                  rows={2}
                />
              </div>
            </div>
            
            {/* 設定 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">設定</h2>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isPremium" className="text-sm font-medium">
                  プレミアムキャラクター
                </label>
              </div>
              
              {formData.isPremium && (
                <>
                  <Input
                    label="価格"
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    min={0}
                  />
                  
                  <div className="mb-4">
                    <label htmlFor="purchaseType" className="block text-sm font-medium mb-1">
                      購入タイプ
                    </label>
                    <select
                      id="purchaseType"
                      value={formData.purchaseType}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md border-gray-300"
                    >
                      <option value="buy">買い切り</option>
                      <option value="subscription">サブスクリプション</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isLimited"
                  checked={formData.isLimited}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isLimited" className="text-sm font-medium">
                  限定キャラクター
                </label>
              </div>
              
              <Input
                label="音声名（TTS用）"
                id="voice"
                value={formData.voice}
                onChange={handleChange}
              />
              
              <Input
                label="テーマカラー"
                id="themeColor"
                type="color"
                value={formData.themeColor}
                onChange={handleChange}
              />
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  有効（表示対象にする）
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              className="bg-gray-500 hover:bg-gray-600"
              onClick={() => router.push('/admin/characters')}
            >
              キャンセル
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? '作成中...' : '作成'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
