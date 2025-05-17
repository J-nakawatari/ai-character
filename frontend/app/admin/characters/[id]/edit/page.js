'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../utils/api';
import Card from '../../../../components/Card';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export default function EditCharacter({ params }) {
  const { id } = params;
  
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
    isActive: true,
    imageCharacterSelect: '',
    imageDashboard: '',
    imageChatBackground: '',
    imageChatAvatar: '',
    sampleVoiceUrl: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    image: '',
    voice: ''
  });
  
  const router = useRouter();
  
  useEffect(() => {
    fetchCharacter();
  }, [id]);
  
  const fetchCharacter = async () => {
    try {
      const res = await api.get(`/admin/characters/${id}`);
      setFormData(res.data);
      setError('');
    } catch (err) {
      console.error('キャラクター情報の取得に失敗:', err);
      setError('キャラクター情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
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
    setSaving(true);
    
    try {
      await api.put(`/admin/characters/${id}`, formData);
      router.push('/admin/characters');
    } catch (err) {
      console.error('キャラクター更新に失敗:', err);
      setError(err.response?.data?.msg || 'キャラクター更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };
  
  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploadStatus({ ...uploadStatus, image: 'アップロード中...' });
      
      const res = await api.post('/admin/characters/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const imageUrl = res.data.imageUrl;
      
      await api.put(`/admin/characters/${id}/image`, {
        imageType,
        imageUrl
      });
      
      setFormData(prev => ({
        ...prev,
        [`image${imageType.charAt(0).toUpperCase() + imageType.slice(1)}`]: imageUrl
      }));
      
      setUploadStatus({ ...uploadStatus, image: 'アップロード完了' });
      
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, image: '' }));
      }, 3000);
    } catch (err) {
      console.error('画像アップロードに失敗:', err);
      setUploadStatus({ ...uploadStatus, image: 'アップロード失敗' });
    }
  };
  
  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('sampleVoice', file);
    
    try {
      setUploadStatus({ ...uploadStatus, voice: 'アップロード中...' });
      
      const res = await api.post('/admin/characters/upload/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const voiceUrl = res.data.voiceUrl;
      
      await api.put(`/admin/characters/${id}/voice`, {
        voiceUrl
      });
      
      setFormData(prev => ({
        ...prev,
        sampleVoiceUrl: voiceUrl
      }));
      
      setUploadStatus({ ...uploadStatus, voice: 'アップロード完了' });
      
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, voice: '' }));
      }, 3000);
    } catch (err) {
      console.error('音声アップロードに失敗:', err);
      setUploadStatus({ ...uploadStatus, voice: 'アップロード失敗' });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">キャラクター編集</h1>
      
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
          
          {/* 画像・音声アップロード */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">画像・音声</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 画像アップロード */}
              <div>
                <h3 className="font-medium mb-2">キャラクター選択画面用画像</h3>
                <div className="mb-4">
                  {formData.imageCharacterSelect && (
                    <img
                      src={formData.imageCharacterSelect}
                      alt="キャラクター選択画像"
                      className="w-32 h-32 object-cover mb-2 rounded"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'characterSelect')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-700"
                  />
                </div>
                
                <h3 className="font-medium mb-2">ダッシュボード用画像</h3>
                <div className="mb-4">
                  {formData.imageDashboard && (
                    <img
                      src={formData.imageDashboard}
                      alt="ダッシュボード画像"
                      className="w-32 h-32 object-cover mb-2 rounded"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'dashboard')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-700"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">チャット背景画像</h3>
                <div className="mb-4">
                  {formData.imageChatBackground && (
                    <img
                      src={formData.imageChatBackground}
                      alt="チャット背景画像"
                      className="w-32 h-32 object-cover mb-2 rounded"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'chatBackground')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-700"
                  />
                </div>
                
                <h3 className="font-medium mb-2">チャットアバター画像</h3>
                <div className="mb-4">
                  {formData.imageChatAvatar && (
                    <img
                      src={formData.imageChatAvatar}
                      alt="チャットアバター画像"
                      className="w-32 h-32 object-cover mb-2 rounded-full"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'chatAvatar')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-700"
                  />
                </div>
              </div>
            </div>
            
            {/* 音声アップロード */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">サンプルボイス</h3>
              <div className="mb-4">
                {formData.sampleVoiceUrl && (
                  <audio controls className="mb-2 w-full">
                    <source src={formData.sampleVoiceUrl} type="audio/mpeg" />
                    お使いのブラウザは音声再生をサポートしていません。
                  </audio>
                )}
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3"
                  onChange={handleVoiceUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-black file:text-white
                    hover:file:bg-gray-700"
                />
              </div>
            </div>
            
            {/* アップロードステータス */}
            {(uploadStatus.image || uploadStatus.voice) && (
              <div className="mt-2 text-sm">
                {uploadStatus.image && (
                  <p className={`${
                    uploadStatus.image.includes('失敗') ? 'text-red-500' : 
                    uploadStatus.image.includes('完了') ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    画像: {uploadStatus.image}
                  </p>
                )}
                {uploadStatus.voice && (
                  <p className={`${
                    uploadStatus.voice.includes('失敗') ? 'text-red-500' : 
                    uploadStatus.voice.includes('完了') ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    音声: {uploadStatus.voice}
                  </p>
                )}
              </div>
            )}
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
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
