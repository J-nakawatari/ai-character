'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../utils/api';
import Card from '../../../../components/Card';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import Toast from '../../../../components/Toast';
import ImageCropper from '../../../../components/ImageCropper';
import '../../../../styles/admin-design-system.css';
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
    characterAccessType: 'subscription', // 'subscription' | 'purchaseOnly' | 'free'
    price: 0,
    purchaseType: 'buy',
    voice: '',
    defaultMessage: {
      ja: '',
      en: ''
    },
    limitMessage: {
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
  const [croppedImages, setCroppedImages] = useState({});
  const ratioOptions = {
    '1:1': { width: 400, height: 400 },
    '16:9': { width: 480, height: 270 }
  };
  const [aspect, setAspect] = useState('1:1');
  const [cropSize, setCropSize] = useState(ratioOptions['1:1']);

  const router = useRouter();

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);
  
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

  const handleAspectChange = (e) => {
    const val = e.target.value;
    setAspect(val);
    setCropSize(ratioOptions[val]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);


    try {
      const fd = new FormData();
      fd.append('name', JSON.stringify(formData.name || { ja: '', en: '' }));
      fd.append('description', JSON.stringify(formData.description || { ja: '', en: '' }));
      fd.append('personalityPrompt', JSON.stringify(formData.personalityPrompt || { ja: '', en: '' }));
      fd.append('adminPrompt', JSON.stringify(formData.adminPrompt || { ja: '', en: '' }));
      fd.append('characterAccessType', formData.characterAccessType);
      fd.append('price', formData.price);
      fd.append('purchaseType', formData.purchaseType);
      fd.append('voice', formData.voice);
      fd.append('defaultMessage', JSON.stringify(formData.defaultMessage || { ja: '', en: '' }));
      
      const limitMessageString = JSON.stringify(formData.limitMessage || { ja: '', en: '' });
      fd.append('limitMessage', limitMessageString);
      
      fd.append('themeColor', formData.themeColor);
      fd.append('isActive', formData.isActive);
      if (croppedImages.characterSelect) {
        const file = new File([croppedImages.characterSelect], `upload_${Date.now()}.jpg`, { type: 'image/jpeg' });
        fd.append('image', file);
      }

      const res = await api.put(`/admin/characters/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(res.data);
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
      e.target.value = '';
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
      e.target.value = '';
    }
  };
  
  const handleCropComplete = async (blob, dataUrl) => {
    setShowCropper(false);
    setPreviewUrl(dataUrl);
    setCroppedImages(prev => ({ ...prev, [imageType]: blob }));
    setFormData(prev => ({
      ...prev,
      [`image${imageType.charAt(0).toUpperCase() + imageType.slice(1)}`]: dataUrl
    }));
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
      <div className={styles.editCharacterPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>読み込み中...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.editCharacterPage}>
      <div className="admin-content">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>キャラクター編集</h1>
        </div>
        
        {error && (
          <div className={styles.errorContainer}>{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* 基本情報セクション */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👤</span>
                基本情報
              </h2>
              <p className={styles.sectionDescription}>キャラクターの基本的な情報を設定します</p>
            </div>
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>キャラクター名</label>
              <div className={styles.languageTabs}>
                <div className={styles.languageTab}>
                  <div className={styles.languageLabel}>
                    <span className={styles.languageFlag}>🇯🇵</span>
                    日本語
                  </div>
                  <input
                    id="name.ja"
                    name="name.ja"
                    value={formData.name.ja}
                    onChange={handleChange}
                    required
                    className={styles['admin-form-input']}
                    placeholder="キャラクターの日本語名を入力してください"
                  />
                </div>
                <div className={styles.languageTab}>
                  <div className={styles.languageLabel}>
                    <span className={styles.languageFlag}>🇺🇸</span>
                    English
                  </div>
                  <input
                    id="name.en"
                    name="name.en"
                    value={formData.name.en}
                    onChange={handleChange}
                    className={styles['admin-form-input']}
                    placeholder="Enter character name in English"
                  />
                </div>
              </div>
            </div>
            <div className={styles['admin-form-group']}>
              <label htmlFor="themeColor" className={styles['admin-form-label']}>テーマカラー</label>
              <div className={styles.themeColorGroup}>
                <input
                  type="color"
                  id="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                  className={styles.colorPicker}
                />
                <input
                  value={formData.themeColor}
                  onChange={handleChange}
                  className={styles['admin-form-input']}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>キャラクター説明</label>
              <div className={styles.languageTabs}>
                <div className={styles.languageTab}>
                  <div className={styles.languageLabel}>
                    <span className={styles.languageFlag}>🇯🇵</span>
                    日本語
                  </div>
                  <textarea
                    id="description.ja"
                    name="description.ja"
                    value={formData.description.ja}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                    placeholder="キャラクターの説明を日本語で入力してください..."
                  />
                </div>
                <div className={styles.languageTab}>
                  <div className={styles.languageLabel}>
                    <span className={styles.languageFlag}>🇺🇸</span>
                    English
                  </div>
                  <textarea
                    id="description.en"
                    name="description.en"
                    value={formData.description.en}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                    placeholder="Enter character description in English..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 会話設定セクション */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💬</span>
                会話設定
              </h2>
              <p className={styles.sectionDescription}>キャラクターの会話に関する設定を行います</p>
            </div>
            
            {/* 性格プロンプト - 日本語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇯🇵</span>
                性格プロンプト（日本語）
              </label>
              <textarea
                id="personalityPrompt.ja"
                name="personalityPrompt.ja"
                value={formData.personalityPrompt.ja}
                onChange={handleChange}
                rows={6}
                className={styles['admin-form-input']}
                placeholder="キャラクターの性格や話し方について日本語で記述してください..."
              />
            </div>

            {/* 性格プロンプト - 英語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇺🇸</span>
                性格プロンプト（English）
              </label>
              <textarea
                id="personalityPrompt.en"
                name="personalityPrompt.en"
                value={formData.personalityPrompt.en}
                onChange={handleChange}
                rows={6}
                className={styles['admin-form-input']}
                placeholder="Describe the character's personality and speaking style in English..."
              />
            </div>

            {/* 管理者プロンプト - 日本語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇯🇵</span>
                管理者プロンプト（日本語）
              </label>
              <textarea
                id="adminPrompt.ja"
                name="adminPrompt.ja"
                value={formData.adminPrompt.ja}
                onChange={handleChange}
                rows={6}
                className={styles['admin-form-input']}
                placeholder="管理者向けの追加設定や注意事項を日本語で記述してください..."
              />
            </div>

            {/* 管理者プロンプト - 英語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇺🇸</span>
                管理者プロンプト（English）
              </label>
              <textarea
                id="adminPrompt.en"
                name="adminPrompt.en"
                value={formData.adminPrompt.en}
                onChange={handleChange}
                rows={6}
                className={styles['admin-form-input']}
                placeholder="Describe admin settings and guidelines in English..."
              />
            </div>

            {/* デフォルトメッセージ - 日本語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇯🇵</span>
                デフォルトメッセージ（日本語）
              </label>
              <textarea
                id="defaultMessage.ja"
                name="defaultMessage.ja"
                value={formData.defaultMessage.ja}
                onChange={handleChange}
                rows={3}
                className={styles['admin-form-input']}
                placeholder="キャラクターの最初の挨拶メッセージを日本語で入力してください..."
              />
            </div>

            {/* デフォルトメッセージ - 英語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇺🇸</span>
                デフォルトメッセージ（English）
              </label>
              <textarea
                id="defaultMessage.en"
                name="defaultMessage.en"
                value={formData.defaultMessage.en}
                onChange={handleChange}
                rows={3}
                className={styles['admin-form-input']}
                placeholder="Enter the character's first greeting message in English..."
              />
            </div>

            {/* 制限メッセージ - 日本語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇯🇵</span>
                制限メッセージ（日本語）
              </label>
              <textarea
                id="limitMessage.ja"
                name="limitMessage.ja"
                value={formData.limitMessage.ja}
                onChange={handleChange}
                rows={3}
                className={styles['admin-form-input']}
                placeholder="1日のチャット制限に達した時に表示するメッセージを日本語で入力してください..."
              />
            </div>

            {/* 制限メッセージ - 英語 */}
            <div className={styles['admin-form-group']}>
              <label className={styles['admin-form-label']}>
                <span className={styles.languageFlag}>🇺🇸</span>
                制限メッセージ（English）
              </label>
              <textarea
                id="limitMessage.en"
                name="limitMessage.en"
                value={formData.limitMessage.en}
                onChange={handleChange}
                rows={3}
                className={styles['admin-form-input']}
                placeholder="Enter the message to display when daily chat limit is reached in English..."
              />
            </div>
          </div>

          {/* 販売設定セクション */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💰</span>
                販売設定
              </h2>
              <p className={styles.sectionDescription}>キャラクターの販売に関する設定を行います</p>
            </div>
            <div className={styles['admin-form-group']} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <label className={styles.customRadio}>
                <input
                  type="radio"
                  name="characterAccessType"
                  value="free"
                  checked={formData.characterAccessType === 'free'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <span className={styles.radioMark}></span>
                <span className={styles.checkboxLabel}>無料キャラ</span>
              </label>
              <label className={styles.customRadio}>
                <input
                  type="radio"
                  name="characterAccessType"
                  value="subscription"
                  checked={formData.characterAccessType === 'subscription'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <span className={styles.radioMark}></span>
                <span className={styles.checkboxLabel}>有料キャラクター</span>
              </label>
              <label className={styles.customRadio}>
                <input
                  type="radio"
                  name="characterAccessType"
                  value="purchaseOnly"
                  checked={formData.characterAccessType === 'purchaseOnly'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <span className={styles.radioMark}></span>
                <span className={styles.checkboxLabel}>買い切りキャラクター</span>
              </label>
            </div>
            
            {formData.characterAccessType === 'purchaseOnly' && (
              <div style={{paddingLeft: '1.5rem', marginTop: '1rem'}}>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="price" className={styles['admin-form-label']}>価格</label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className={styles['admin-form-input']}
                  />
                </div>
              </div>
            )}
          </div>

          {/* メディア設定セクション */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎨</span>
                メディア設定
              </h2>
              <p className={styles.sectionDescription}>キャラクターの画像と音声を設定します</p>
            </div>
            <div className={styles['media-upload-section']}>
              <div className={styles['media-upload-label']}>
                👤 キャラクター選択画面画像
              </div>
              {formData.imageCharacterSelect && (
                <img
                  src={formData.imageCharacterSelect}
                  alt="Character Select"
                  className={styles['media-upload-preview']}
                />
              )}
              <label className={styles['media-upload-btn']}>
                📁 ファイルを選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'characterSelect')}
                  className={styles['media-upload-file-input']}
                />
              </label>
            </div>
            <div className={styles['media-upload-section']}>
              <div className={styles['media-upload-label']}>
                📊 ダッシュボード画像
              </div>
              {formData.imageDashboard && (
                <img
                  src={formData.imageDashboard}
                  alt="Dashboard"
                  className={styles['media-upload-preview']}
                />
              )}
              <label className={styles['media-upload-btn']}>
                📁 ファイルを選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'dashboard')}
                  className={styles['media-upload-file-input']}
                />
              </label>
            </div>
            <div className={styles['media-upload-section']}>
              <div className={styles['media-upload-label']}>
                🖼️ チャット背景画像
              </div>
              {formData.imageChatBackground && (
                <img
                  src={formData.imageChatBackground}
                  alt="Chat Background"
                  className={styles['media-upload-preview']}
                />
              )}
              <label className={styles['media-upload-btn']}>
                📁 ファイルを選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'chatBackground')}
                  className={styles['media-upload-file-input']}
                />
              </label>
            </div>
            <div className={styles['media-upload-section']}>
              <div className={styles['media-upload-label']}>
                💬 チャットアバター画像
              </div>
              {formData.imageChatAvatar && (
                <img
                  src={formData.imageChatAvatar}
                  alt="Chat Avatar"
                  className={styles['media-upload-preview']}
                />
              )}
              <label className={styles['media-upload-btn']}>
                📁 ファイルを選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'chatAvatar')}
                  className={styles['media-upload-file-input']}
                />
              </label>
            </div>
            <div className={styles['media-upload-section']}>
              <div className={styles['media-upload-label']}>
                🎵 サンプル音声
              </div>
              {formData.sampleVoiceUrl && (
                <audio controls className={styles['audio-preview']}>
                  <source src={formData.sampleVoiceUrl} type="audio/mpeg" />
                </audio>
              )}
              <label className={styles['media-upload-btn']}>
                📁 ファイルを選択
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleVoiceUpload}
                  className={styles['media-upload-file-input']}
                />
              </label>
            </div>
          </div>

          {/* アクションボタン */}
          <div className={styles.actionButtons}>
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
              {saving ? '💾 保存中...' : '💾 保存'}
            </button>
          </div>
        </form>
      </div>

      {showCropper && selectedImage && (
        <div className={styles['cropper-modal-overlay']}>
          <div className={styles['cropper-modal-content']}>
            <h3 className={styles['cropper-modal-title']}>画像のトリミング</h3>
            <div className="mb-4">
              <label className="mr-2">アスペクト比:</label>
              <select value={aspect} onChange={handleAspectChange}>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
            <ImageCropper
              image={selectedImage}
              cropWidth={cropSize.width}
              cropHeight={cropSize.height}
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

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
