'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../utils/api';
import Card from '../../../../components/Card';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import Toast from '../../../../components/Toast';
import ImageCropper from '../../../../components/ImageCropper';
import styles from './page.module.css';

export default function EditCharacter({ params }) {
  const { id } = use(params);
  
  const [formData, setFormData] = useState({
    name: {
      ja: '',
      en: ''
    },
    description: {
      ja: '',
      en: ''
    },
    personalityPrompt: {
      ja: '',
      en: ''
    },
    adminPrompt: {
      ja: '',
      en: ''
    },
    characterType: 'premium', // 'premium' | 'paid' | 'limited'
    price: 0,
    purchaseType: 'buy',
    voice: '',
    defaultMessage: {
      ja: '',
      en: ''
    },
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageType, setImageType] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
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
    const { name, value, type, checked, id } = e.target;
    const key = name || id;
    if (key && key.includes('.')) {
      const [parent, child] = key.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      console.log('送信するデータ:', formData);
      const dataToSend = {
        ...formData,
        isActive: formData.isActive
      };
      console.log('実際に送信するデータ:', dataToSend);
      
      await api.put(`/admin/characters/${id}`, dataToSend);
      setToast({ show: true, message: 'キャラクターを更新しました', type: 'success' });
      setTimeout(() => {
        router.push('/admin/characters');
      }, 1500);
    } catch (err) {
      console.error('キャラクター更新に失敗:', err);
      setError(err.response?.data?.msg || 'キャラクター更新に失敗しました');
      setToast({ show: true, message: err.response?.data?.msg || 'キャラクター更新に失敗しました', type: 'error' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下である必要があります');
      setToast({ show: true, message: 'ファイルサイズは5MB以下である必要があります', type: 'error' });
      return;
    }
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setImageType(type);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      return;
    }
    
    if (file.type.startsWith('audio/')) {
      const formData = new FormData();
      formData.append('sampleVoice', file);
      
      try {
        setUploadStatus({ ...uploadStatus, voice: 'アップロード中...' });
        
        const res = await api.post('/admin/characters/upload/voice', formData);
        
        const voiceUrl = res.data.voiceUrl;
        
        await api.put(`/admin/characters/${id}/voice`, {
          voiceUrl
        });
        
        setFormData(prev => ({
          ...prev,
          sampleVoiceUrl: voiceUrl
        }));
        
        setUploadStatus({ ...uploadStatus, voice: 'アップロード完了' });
        setToast({ show: true, message: '音声ファイルがアップロードされました', type: 'success' });
        
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, voice: '' }));
        }, 3000);
      } catch (err) {
        console.error('音声アップロードに失敗:', err);
        setUploadStatus({ ...uploadStatus, voice: 'アップロード失敗' });
        setToast({ show: true, message: '音声ファイルのアップロードに失敗しました', type: 'error' });
      }
    }
  };
  
  const handleCropComplete = async (blob, dataUrl) => {
    setShowCropper(false);
    setPreviewUrl(dataUrl);
    
    const imageSizes = {
      characterSelect: '238x260',
      dashboard: '320x528',
      chatBackground: '455x745',
      chatAvatar: '400x400'
    };
    
    const fileName = `cropped_${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploadStatus({ ...uploadStatus, image: 'アップロード中...' });
      
      const res = await api.post('/admin/characters/upload/image', formData);
      
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
      setToast({ show: true, message: '画像がアップロードされました', type: 'success' });
      
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, image: '' }));
      }, 3000);
    } catch (err) {
      console.error('画像アップロードに失敗:', err);
      setUploadStatus({ ...uploadStatus, image: 'アップロード失敗' });
      setError('画像のアップロードに失敗しました');
      setToast({ show: true, message: '画像のアップロードに失敗しました', type: 'error' });
    }
  };
  
  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('sampleVoice', file);
    
    try {
      setUploadStatus({ ...uploadStatus, voice: 'アップロード中...' });
      
      const res = await api.post('/admin/characters/upload/voice', formData);
      
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
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-content">
      <h1 className="admin-dashboard-title">キャラクター編集</h1>
      <div className="admin-content-wrapper">
        {error && (
          <div className="admin-stats-card-wrapper error">{error}</div>
        )}
        <div className="admin-stats-card-wrapper">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper">
                  <h2 className="admin-stats-title">基本情報</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの基本的な情報を設定します</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className={styles['admin-form-group']}>
                    <label className={styles['admin-form-label']}>キャラクター名</label>
                    <div className="language-tabs">
                      <div className="language-tab">
                        <div className="language-label">🇯🇵 日本語</div>
                        <Input
                          id="name.ja"
                          name="name.ja"
                          value={formData.name.ja}
                          onChange={handleChange}
                          required
                          className={styles['admin-form-input']}
                        />
                      </div>
                      <div className="language-tab">
                        <div className="language-label">🇺🇸 English</div>
                        <Input
                          id="name.en"
                          name="name.en"
                          value={formData.name.en}
                          onChange={handleChange}
                          className={styles['admin-form-input']}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="themeColor" className={styles['admin-form-label']}>テーマカラー</label>
                    <div className="admin-form-group-themeColor">
                      <input
                        type="color"
                        id="themeColor"
                        value={formData.themeColor}
                        onChange={handleChange}
                        className="h-8 w-8 rounded border border-gray-300"
                      />
                      <Input
                        value={formData.themeColor}
                        onChange={handleChange}
                        className={styles['admin-form-input'] + ' flex-1'}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['admin-form-group']}>
                  <label className={styles['admin-form-label']}>キャラクター説明</label>
                  <div className="language-tabs">
                    <div className="language-tab">
                      <div className="language-label">🇯🇵 日本語</div>
                      <textarea
                        id="description.ja"
                        name="description.ja"
                        value={formData.description.ja}
                        onChange={handleChange}
                        rows={3}
                        className={styles['admin-form-input']}
                      />
                    </div>
                    <div className="language-tab">
                      <div className="language-label">🇺🇸 English</div>
                      <textarea
                        id="description.en"
                        name="description.en"
                        value={formData.description.en}
                        onChange={handleChange}
                        rows={3}
                        className={styles['admin-form-input']}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 会話設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper">
                  <h2 className="admin-stats-title">会話設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの会話に関する設定を行います</p>
                </div>
                <div className={styles['admin-form-group']}>
                  <label className={styles['admin-form-label']}>性格プロンプト</label>
                  <div className="language-tabs">
                    <div className="language-tab">
                      <div className="language-label">🇯🇵 日本語</div>
                      <textarea
                        id="personalityPrompt.ja"
                        name="personalityPrompt.ja"
                        value={formData.personalityPrompt.ja}
                        onChange={handleChange}
                        rows={4}
                        className={styles['admin-form-input']}
                      />
                    </div>
                    <div className="language-tab">
                      <div className="language-label">🇺🇸 English</div>
                      <textarea
                        id="personalityPrompt.en"
                        name="personalityPrompt.en"
                        value={formData.personalityPrompt.en}
                        onChange={handleChange}
                        rows={4}
                        className={styles['admin-form-input']}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['admin-form-group']}>
                  <label className={styles['admin-form-label']}>管理者プロンプト</label>
                  <div className="language-tabs">
                    <div className="language-tab">
                      <div className="language-label">🇯🇵 日本語</div>
                      <textarea
                        id="adminPrompt.ja"
                        name="adminPrompt.ja"
                        value={formData.adminPrompt.ja}
                        onChange={handleChange}
                        rows={4}
                        className={styles['admin-form-input']}
                      />
                    </div>
                    <div className="language-tab">
                      <div className="language-label">🇺🇸 English</div>
                      <textarea
                        id="adminPrompt.en"
                        name="adminPrompt.en"
                        value={formData.adminPrompt.en}
                        onChange={handleChange}
                        rows={4}
                        className={styles['admin-form-input']}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['admin-form-group']}>
                  <label className={styles['admin-form-label']}>デフォルトメッセージ</label>
                  <div className="language-tabs">
                    <div className="language-tab">
                      <div className="language-label">🇯🇵 日本語</div>
                      <textarea
                        id="defaultMessage.ja"
                        name="defaultMessage.ja"
                        value={formData.defaultMessage.ja}
                        onChange={handleChange}
                        rows={2}
                        className={styles['admin-form-input']}
                      />
                    </div>
                    <div className="language-tab">
                      <div className="language-label">🇺🇸 English</div>
                      <textarea
                        id="defaultMessage.en"
                        name="defaultMessage.en"
                        value={formData.defaultMessage.en}
                        onChange={handleChange}
                        rows={2}
                        className={styles['admin-form-input']}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 販売設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper">
                  <h2 className="admin-stats-title">販売設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの販売に関する設定を行います</p>
                </div>
                <div className={styles['admin-form-group']} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label className={styles.customRadio}>
                    <input
                      type="radio"
                      name="characterType"
                      value="premium"
                      checked={formData.characterType === 'premium'}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioMark}></span>
                    <span className={styles.checkboxLabel}>サブスク会員用キャラクター</span>
                  </label>
                  <label className={styles.customRadio}>
                    <input
                      type="radio"
                      name="characterType"
                      value="paid"
                      checked={formData.characterType === 'paid'}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioMark}></span>
                    <span className={styles.checkboxLabel}>課金キャラクター</span>
                  </label>
                  <label className={styles.customRadio}>
                    <input
                      type="radio"
                      name="characterType"
                      value="limited"
                      checked={formData.characterType === 'limited'}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioMark}></span>
                    <span className={styles.checkboxLabel}>期間限定キャラクター</span>
                  </label>
                  <label className={styles.customRadio}>
                    <input
                      type="radio"
                      name="characterType"
                      value="free"
                      checked={formData.characterType === 'free'}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioMark}></span>
                    <span className={styles.checkboxLabel}>無料キャラ</span>
                  </label>
                </div>
                {formData.characterType === 'paid' && (
                  <div className="space-y-4 pl-6 mt-2">
                    <div className={styles['admin-form-group']}>
                      <label htmlFor="price" className={styles['admin-form-label']}>価格</label>
                      <Input
                        type="number"
                        id="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        className={styles['admin-form-input']}
                      />
                    </div>
                    <div className={styles['admin-form-group']}>
                      <label htmlFor="purchaseType" className={styles['admin-form-label']}>購入タイプ</label>
                      <select
                        id="purchaseType"
                        value={formData.purchaseType}
                        onChange={handleChange}
                        className={styles['admin-form-input']}
                      >
                        <option value="buy">買い切り</option>
                        <option value="rent">レンタル</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* メディア設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper">
                  <h2 className="admin-stats-title">メディア設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの画像と音声を設定します</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className={styles['media-upload-section']}>
                    <div className={styles['media-upload-label']}>キャラクター選択画面画像</div>
                    {formData.imageCharacterSelect && (
                      <img
                        src={formData.imageCharacterSelect}
                        alt="Character Select"
                        className={styles['media-upload-preview']}
                      />
                    )}
                    <label className={styles['media-upload-btn']}>
                      ファイルを選択
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'characterSelect')}
                        className={styles['media-upload-file-input']}
                      />
                    </label>
                  </div>
                  <div className={styles['media-upload-section']}>
                    <div className={styles['media-upload-label']}>ダッシュボード画像</div>
                    {formData.imageDashboard && (
                      <img
                        src={formData.imageDashboard}
                        alt="Dashboard"
                        className={styles['media-upload-preview']}
                      />
                    )}
                    <label className={styles['media-upload-btn']}>
                      ファイルを選択
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'dashboard')}
                        className={styles['media-upload-file-input']}
                      />
                    </label>
                  </div>
                  <div className={styles['media-upload-section']}>
                    <div className={styles['media-upload-label']}>チャット背景画像</div>
                    {formData.imageChatBackground && (
                      <img
                        src={formData.imageChatBackground}
                        alt="Chat Background"
                        className={styles['media-upload-preview']}
                      />
                    )}
                    <label className={styles['media-upload-btn']}>
                      ファイルを選択
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'chatBackground')}
                        className={styles['media-upload-file-input']}
                      />
                    </label>
                  </div>
                  <div className={styles['media-upload-section']}>
                    <div className={styles['media-upload-label']}>チャットアバター画像</div>
                    {formData.imageChatAvatar && (
                      <img
                        src={formData.imageChatAvatar}
                        alt="Chat Avatar"
                        className={styles['media-upload-preview']}
                      />
                    )}
                    <label className={styles['media-upload-btn']}>
                      ファイルを選択
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'chatAvatar')}
                        className={styles['media-upload-file-input']}
                      />
                    </label>
                  </div>
                </div>
                <div className={styles['media-upload-section']} style={{maxWidth:'400px'}}>
                  <div className={styles['media-upload-label']}>サンプル音声</div>
                  {formData.sampleVoiceUrl && (
                    <audio controls className={styles['audio-preview']}>
                      <source src={formData.sampleVoiceUrl} type="audio/mpeg" />
                    </audio>
                  )}
                  <label className={styles['media-upload-btn']}>
                    ファイルを選択
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceUpload}
                      className={styles['media-upload-file-input']}
                    />
                  </label>
                </div>
              </div>
            </Card>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/characters')}
                className={styles['cancel-btn']}
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={styles['save-btn']}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCropper && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
