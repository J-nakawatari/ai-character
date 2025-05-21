'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import ImageCropper from '../../../components/ImageCropper';
import styles from './page.module.css';

export default function NewCharacter() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personalityPrompt: '',
    adminPrompt: '',
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
  const [loading, setLoading] = useState(false);
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
      console.log('送信するデータ:', formData);
      const dataToSend = {
        ...formData,
        isPremium: formData.isPremium,
        isLimited: formData.isLimited,
        isActive: formData.isActive
      };
      console.log('実際に送信するデータ:', dataToSend);
      
      const res = await api.post('/admin/characters', dataToSend);
      setToast({ show: true, message: 'キャラクターを作成しました', type: 'success' });
      setTimeout(() => {
        router.push(`/admin/characters/${res.data._id}/edit`);
      }, 1500);
    } catch (err) {
      console.error('キャラクター作成に失敗:', err);
      setError(err.response?.data?.msg || 'キャラクター作成に失敗しました');
      setToast({ show: true, message: err.response?.data?.msg || 'キャラクター作成に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
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
      const formDataUpload = new FormData();
      formDataUpload.append('sampleVoice', file);
      
      try {
        setUploadStatus({ ...uploadStatus, voice: 'アップロード中...' });
        
        const res = await api.post('/admin/characters/upload/voice', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const voiceUrl = res.data.voiceUrl;
        
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
    
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    try {
      setUploadStatus({ ...uploadStatus, image: 'アップロード中...' });
      
      const res = await api.post('/admin/characters/upload/image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const imageUrl = res.data.imageUrl;
      
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
      setToast({ show: true, message: '画像のアップロードに失敗しました', type: 'error' });
    }
  };
  
  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formDataUpload = new FormData();
    formDataUpload.append('sampleVoice', file);
    
    try {
      setUploadStatus({ ...uploadStatus, voice: 'アップロード中...' });
      
      const res = await api.post('/admin/characters/upload/voice', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const voiceUrl = res.data.voiceUrl;
      
      setFormData(prev => ({
        ...prev,
        sampleVoiceUrl: voiceUrl
      }));
      
      setUploadStatus({ ...uploadStatus, voice: 'アップロード完了' });
      
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, voice: '' }));
      }, 3000);
      
      return voiceUrl;
    } catch (err) {
      console.error('音声アップロードに失敗:', err);
      setUploadStatus({ ...uploadStatus, voice: 'アップロード失敗' });
      return null;
    }
  };
  
  return (
    <div className="admin-content">
      <h1 className="admin-dashboard-title">新規キャラクター作成</h1>
      <div className="admin-content-wrapper">
        <div className="admin-stats-card-wrapper">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
                  <h2 className="admin-stats-title">基本情報</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの基本的な情報を設定します</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="name" className={styles['admin-form-label']}>キャラクター名</label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={styles['admin-form-input']}
                    />
                  </div>
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="themeColor" className={styles['admin-form-label']}>テーマカラー</label>
                    <div className="admin-form-group-themeColor flex items-center space-x-2 mt-1">
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
                  <label htmlFor="description" className={styles['admin-form-label']}>キャラクター説明</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={styles['admin-form-input']}
                  />
                </div>
              </div>
            </Card>
            {/* 会話設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
                  <h2 className="admin-stats-title">会話設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの会話に関する設定を行います</p>
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="personalityPrompt" className={styles['admin-form-label']}>性格プロンプト</label>
                  <textarea
                    id="personalityPrompt"
                    value={formData.personalityPrompt}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                  />
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="adminPrompt" className={styles['admin-form-label']}>管理者プロンプト</label>
                  <textarea
                    id="adminPrompt"
                    value={formData.adminPrompt}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                  />
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="defaultMessage" className={styles['admin-form-label']}>デフォルトメッセージ</label>
                  <textarea
                    id="defaultMessage"
                    value={formData.defaultMessage}
                    onChange={handleChange}
                    rows={2}
                    className={styles['admin-form-input']}
                  />
                </div>
              </div>
            </Card>
            {/* 販売設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
                  <h2 className="admin-stats-title">販売設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの販売に関する設定を行います</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className={styles['admin-form-group']}>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        id="isPremium"
                        checked={formData.isPremium}
                        onChange={handleChange}
                      />
                      <span className="checkbox-mark"></span>
                      <span className="checkbox-label">サブスク会員用キャラクター</span>
                    </label>
                    {formData.isPremium && (
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
                         <option value="rent">月額課金</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles['admin-form-group']}>
                    <label className="custom-checkbox square">
                      <input
                        type="checkbox"
                        id="isLimited"
                        checked={formData.isLimited}
                        onChange={handleChange}
                      />
                      <span className="checkbox-mark"></span>
                      <span className="checkbox-label">課金キャラクター</span>
                    </label>
                  </div>
                  <div className={styles['admin-form-group']}>
                    <label className="toggle-switch" style={{marginRight: '10px'}}>
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="checkbox-label">アクティブ</span>
                  </div>
                </div>
              </div>
            </Card>
            {/* メディア設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
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
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={styles['save-btn']}
                disabled={loading}
              >
                {loading ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
      {showCropper && selectedImage && (
        <div className={styles['cropper-modal-overlay']}>
          <div className={styles['cropper-modal-content']}>
            <h3 className={styles['cropper-modal-title']}>画像のトリミング</h3>
            <ImageCropper
              image={selectedImage}
              cropWidth={imageType === 'characterSelect' ? 238 : imageType === 'dashboard' ? 320 : imageType === 'chatBackground' ? 455 : 400}
              cropHeight={imageType === 'characterSelect' ? 260 : imageType === 'dashboard' ? 528 : imageType === 'chatBackground' ? 745 : 400}
              onCropComplete={handleCropComplete}
              className={styles['cropper-canvas']}
              sliderClassName={styles['cropper-slider']}
              sizeLabelClassName={styles['cropper-size-label']}
              saveButtonClassName={styles['cropper-btn']}
              saveButtonText="切り抜いて保存"
              cancelButtonClassName={styles['cropper-btn'] + ' ' + styles['cancel']}
              cancelButtonText="キャンセル"
              onCancel={() => setShowCropper(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
