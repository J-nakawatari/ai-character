'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import ImageCropper from '../../../components/ImageCropper';
import styles from './page.module.css';

const initialState = {
  name: { ja: '', en: '' },
  description: { ja: '', en: '' },
  personality: '',
  personalityPrompt: { ja: '', en: '' },
  adminPrompt: { ja: '', en: '' },
  characterAccessType: 'free',
  // 新しいトークン制フィールド
  isBaseCharacter: false,
  requiresUnlock: false,
  model: 'gpt-3.5-turbo',
  gender: 'neutral',
  personalityPreset: 'おっとり系',
  personalityTags: [],
  price: 0,
  purchaseType: 'buy',
  voice: '',
  defaultMessage: { ja: '', en: '' },
  limitMessage: { 
    ja: '今日はもうお話しできないよ。また明日ね。',
    en: 'Looks like we can\'t chat anymore today. Let\'s talk tomorrow!'
  },
  themeColor: '#000000',
  isActive: true,
  imageCharacterSelect: '',
  imageDashboard: '',
  imageChatBackground: '',
  imageChatAvatar: '',
  sampleVoiceUrl: '',
  galleryImage1: '',
  galleryImage2: '',
  galleryImage3: '',
  galleryImage4: '',
  galleryImage5: '',
  galleryImage6: '',
  galleryImage7: '',
  galleryImage8: '',
  galleryImage9: '',
  galleryImage10: '',
};

// 性格プリセットの選択肢
const personalityPresets = [
  'おっとり系', '元気系', 'クール系', '真面目系', 'セクシー系', 
  '天然系', 'ボーイッシュ系', 'お姉さん系'
];

// 性格タグの選択肢
const personalityTags = [
  '明るい', 'よく笑う', '甘えん坊', '積極的', '大人っぽい', 
  '静か', '天然', 'ボーイッシュ', 'ポジティブ', 'やや毒舌', 
  '癒し系', '元気いっぱい', '知的', '優しい', '人懐っこい'
];

export default function CharacterNewPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  // 性格タグの変更処理
  const handlePersonalityTagChange = (tag) => {
    setForm(prev => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter(t => t !== tag)
        : [...prev.personalityTags, tag]
    }));
  };

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', JSON.stringify(form.name));
      fd.append('description', JSON.stringify(form.description));
      fd.append('personality', form.personality || '');
      fd.append('personalityPrompt', JSON.stringify(form.personalityPrompt));
      fd.append('adminPrompt', JSON.stringify(form.adminPrompt));
      fd.append('characterAccessType', form.characterAccessType);
      // 新しいトークン制フィールド
      fd.append('isBaseCharacter', form.isBaseCharacter);
      fd.append('requiresUnlock', form.requiresUnlock);
      fd.append('model', form.model);
      fd.append('gender', form.gender);
      fd.append('personalityPreset', form.personalityPreset);
      fd.append('personalityTags', JSON.stringify(form.personalityTags));
      fd.append('price', form.price);
      fd.append('purchaseType', form.purchaseType);
      fd.append('voice', form.voice);
      fd.append('defaultMessage', JSON.stringify(form.defaultMessage));
      fd.append('limitMessage', JSON.stringify(form.limitMessage));
      fd.append('themeColor', form.themeColor);
      fd.append('isActive', form.isActive);
      fd.append('imageCharacterSelect', form.imageCharacterSelect || '');
      fd.append('imageDashboard', form.imageDashboard || '');
      fd.append('imageChatBackground', form.imageChatBackground || '');
      fd.append('imageChatAvatar', form.imageChatAvatar || '');
      fd.append('sampleVoiceUrl', form.sampleVoiceUrl || '');

      const response = await api.post('/admin/characters', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        setToast({ show: true, message: 'キャラクターを作成しました', type: 'success' });
        setTimeout(() => {
          router.push('/admin/characters');
        }, 1500);
      }
    } catch (err) {
      console.error('キャラクター登録に失敗:', err);
      setError(err.response?.data?.msg || '登録に失敗しました');
      setToast({ show: true, message: err.response?.data?.msg || '登録に失敗しました', type: 'error' });
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
      e.target.value = '';
      return;
    }
    
    if (file.type.startsWith('audio/')) {
      const formDataUpload = new FormData();
      formDataUpload.append('sampleVoice', file);
      
      try {
        setUploadStatus({ ...uploadStatus, voice: 'アップロード中...' });
        
      const res = await api.post('/admin/characters/upload/voice', formDataUpload);
        
        const voiceUrl = res.data.voiceUrl;
        
        setForm(prev => ({
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
      
      const res = await api.post('/admin/characters/upload/image', formDataUpload);
      
      const imageUrl = res.data.imageUrl;
      
      setForm(prev => ({
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
      
      const res = await api.post('/admin/characters/upload/voice', formDataUpload);
      
      const voiceUrl = res.data.voiceUrl;
      
      setForm(prev => ({
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
      <h1 className="admin-dashboard-title">キャラクター新規登録</h1>
      {error && <div className="admin-error-message">{error}</div>}
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
                    <label htmlFor="name.ja" className={styles['admin-form-label']}>キャラクター名（日本語）</label>
                    <Input
                      id="name.ja"
                      name="name.ja"
                      value={form.name.ja}
                      onChange={handleChange}
                      required
                      className={styles['admin-form-input']}
                    />
                  </div>
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="name.en" className={styles['admin-form-label']}>キャラクター名（English）</label>
                    <Input
                      id="name.en"
                      name="name.en"
                      value={form.name.en}
                      onChange={handleChange}
                      className={styles['admin-form-input']}
                    />
                  </div>
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="themeColor" className={styles['admin-form-label']}>テーマカラー</label>
                    <div className="admin-form-group-themeColor flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        id="themeColor"
                        name="themeColor"
                        value={form.themeColor}
                        onChange={handleChange}
                        className="h-8 w-8 rounded border border-gray-300"
                      />
                      <Input
                        name="themeColor"
                        value={form.themeColor}
                        onChange={handleChange}
                        className={styles['admin-form-input'] + ' flex-1'}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="description.ja" className={styles['admin-form-label']}>キャラクター説明（日本語）</label>
                  <textarea
                    id="description.ja"
                    name="description.ja"
                    value={form.description.ja}
                    onChange={handleChange}
                    rows={3}
                    className={styles['admin-form-input']}
                  />
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="description.en" className={styles['admin-form-label']}>キャラクター説明（English）</label>
                  <textarea
                    id="description.en"
                    name="description.en"
                    value={form.description.en}
                    onChange={handleChange}
                    rows={3}
                    className={styles['admin-form-input']}
                  />
                </div>
              </div>
            </Card>

            {/* 性格・特徴設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
                  <h2 className="admin-stats-title">性格・特徴設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの性格とAIプロンプト自動生成の設定を行います</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="gender" className={styles['admin-form-label']}>性別</label>
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={styles['admin-form-input']}
                    >
                      <option value="neutral">中性</option>
                      <option value="female">女性</option>
                      <option value="male">男性</option>
                    </select>
                  </div>
                  
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="personalityPreset" className={styles['admin-form-label']}>性格プリセット</label>
                    <select
                      id="personalityPreset"
                      name="personalityPreset"
                      value={form.personalityPreset}
                      onChange={handleChange}
                      className={styles['admin-form-input']}
                    >
                      {personalityPresets.map(preset => (
                        <option key={preset} value={preset}>{preset}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles['admin-form-group']}>
                  <label className={styles['admin-form-label']}>性格タグ（複数選択可）</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {personalityTags.map(tag => (
                      <label key={tag} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.personalityTags.includes(tag)}
                          onChange={() => handlePersonalityTagChange(tag)}
                          className="rounded"
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                  {form.personalityTags.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      選択中: {form.personalityTags.join('、')}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* トークン制設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
                  <h2 className="admin-stats-title">トークン制設定</h2>
                  <p className="mt-1 text-sm text-gray-500">新しいトークン制に関する設定を行います</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className={styles['admin-form-group']}>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isBaseCharacter"
                        checked={form.isBaseCharacter}
                        onChange={handleChange}
                      />
                      <span className={styles['admin-form-label']}>無料キャラクター（1日5回まで）</span>
                    </label>
                  </div>
                  
                  <div className={styles['admin-form-group']}>
                    <label htmlFor="model" className={styles['admin-form-label']}>使用AIモデル</label>
                    <select
                      id="model"
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      className={styles['admin-form-input']}
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* 会話設定セクション */}
            <Card>
              <div className="space-y-6">
                <div className="admin-stats-title-rapper border-b border-gray-200 pb-4">
                  <h2 className="admin-stats-title">会話設定</h2>
                  <p className="mt-1 text-sm text-gray-500">キャラクターの会話に関する設定を行います（性格設定と併用）</p>
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="personalityPrompt.ja" className={styles['admin-form-label']}>性格プロンプト（日本語）</label>
                  <textarea
                    id="personalityPrompt.ja"
                    name="personalityPrompt.ja"
                    value={form.personalityPrompt.ja}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                  />
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="personalityPrompt.en" className={styles['admin-form-label']}>性格プロンプト（English）</label>
                  <textarea
                    id="personalityPrompt.en"
                    name="personalityPrompt.en"
                    value={form.personalityPrompt.en}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                  />
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="adminPrompt.ja" className={styles['admin-form-label']}>管理者プロンプト（日本語）</label>
                  <textarea
                    id="adminPrompt.ja"
                    name="adminPrompt.ja"
                    value={form.adminPrompt.ja}
                    onChange={handleChange}
                    rows={4}
                    className={styles['admin-form-input']}
                  />
                </div>
                <div className={styles['admin-form-group']}>
                  <label htmlFor="adminPrompt.en" className={styles['admin-form-label']}>管理者プロンプト（English）</label>
                  <textarea
                    id="adminPrompt.en"
                    name="adminPrompt.en"
                    value={form.adminPrompt.en}
                    onChange={handleChange}
                    rows={4}
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
                <div className={styles['admin-form-group']} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label className={styles.customRadio}>
                    <input
                      type="radio"
                      name="characterAccessType"
                      value="free"
                      checked={form.characterAccessType === 'free'}
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
                      checked={form.characterAccessType === 'subscription'}
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
                      checked={form.characterAccessType === 'purchaseOnly'}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioMark}></span>
                    <span className={styles.checkboxLabel}>買い切りキャラクター</span>
                  </label>
                </div>
                
                {form.characterAccessType === 'purchaseOnly' && (
                  <div className="space-y-4 pl-6 mt-2">
                    <div className={styles['admin-form-group']}>
                      <label htmlFor="price" className={styles['admin-form-label']}>価格</label>
                      <Input
                        type="number"
                        id="price"
                        value={form.price}
                        onChange={handleChange}
                        min="0"
                        className={styles['admin-form-input']}
                      />
                    </div>
                  </div>
                )}
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
                    {form.imageCharacterSelect && (
                      <img
                        src={form.imageCharacterSelect}
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
                    {form.imageDashboard && (
                      <img
                        src={form.imageDashboard}
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
                    {form.imageChatBackground && (
                      <img
                        src={form.imageChatBackground}
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
                    {form.imageChatAvatar && (
                      <img
                        src={form.imageChatAvatar}
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
                  {form.sampleVoiceUrl && (
                    <audio controls className={styles['audio-preview']}>
                      <source src={form.sampleVoiceUrl} type="audio/mpeg" />
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
                
                {/* ギャラリー画像セクション */}
                <div style={{marginTop: '2rem'}}>
                  <div className="admin-stats-title-rapper border-b border-gray-200 pb-4 mb-6">
                    <h3 className="admin-stats-title">ダッシュボードギャラリー（10枚）</h3>
                    <p className="mt-1 text-sm text-gray-500">親密度レベルに応じて段階的に解放される画像を設定します</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {Array.from({length: 10}, (_, index) => (
                      <div key={index} className={styles['media-upload-section']} style={{textAlign:'center'}}>
                        <div className={styles['media-upload-label']} style={{fontSize:'0.875rem'}}>
                          ギャラリー{index + 1}
                        </div>
                        {form[`galleryImage${index + 1}`] && (
                          <img
                            src={form[`galleryImage${index + 1}`]}
                            alt={`Gallery ${index + 1}`}
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '8px'
                            }}
                          />
                        )}
                        <label className={styles['media-upload-btn']} style={{fontSize:'0.75rem', padding:'8px 12px'}}>
                          選択
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, `gallery${index + 1}`)}
                            className={styles['media-upload-file-input']}
                          />
                        </label>
                        <div style={{
                          fontSize: '0.625rem',
                          color: '#6b7280',
                          marginTop: '4px'
                        }}>
                          推奨: 400x400px
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    padding: '12px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #0ea5e9',
                    fontSize: '0.875rem',
                    color: '#0369a1'
                  }}>
                    💡 ヒント: ギャラリー画像は親密度レベル10, 20, 30...のように段階的に解放されます
                  </div>
                </div>
              </div>
            </Card>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">メッセージ設定</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">デフォルトメッセージ（日本語）</div>
                  <textarea
                    name="defaultMessage.ja"
                    value={form.defaultMessage.ja}
                    onChange={handleChange}
                    className="admin-textarea"
                    rows={4}
                  />
                </div>
                <div>
                  <div className="character-detail-label">デフォルトメッセージ（英語）</div>
                  <textarea
                    name="defaultMessage.en"
                    value={form.defaultMessage.en}
                    onChange={handleChange}
                    className="admin-textarea"
                    rows={4}
                  />
                </div>
                <div>
                  <div className="character-detail-label">制限メッセージ（日本語）</div>
                  <textarea
                    name="limitMessage.ja"
                    value={form.limitMessage.ja}
                    onChange={handleChange}
                    className="admin-textarea"
                    rows={4}
                  />
                </div>
                <div>
                  <div className="character-detail-label">制限メッセージ（英語）</div>
                  <textarea
                    name="limitMessage.en"
                    value={form.limitMessage.en}
                    onChange={handleChange}
                    className="admin-textarea"
                    rows={4}
                  />
                </div>
                <div>
                  <div className="character-detail-label">音声設定</div>
                  <input
                    type="text"
                    name="voice"
                    value={form.voice}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
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
        <Toast message={typeof toast.message === 'object' ? (toast.message.ja || toast.message.en || '') : toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
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
