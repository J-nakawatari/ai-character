'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import ImageCropper from '../../../components/ImageCropper';

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
    <div>
      <h1 className="admin-dashboard-title">新規キャラクター作成</h1>
      <div className="admin-stats-card" style={{maxWidth:'700px', margin:'0 auto', padding:'32px 36px'}}>
        <div className="admin-stats-title" style={{marginBottom:'24px'}}><span className="admin-stats-icon">➕</span>キャラクター情報入力</div>
        <form onSubmit={handleSubmit} style={{width:'100%'}}>
          <div style={{marginBottom:'24px'}}>
            <label className="admin-stats-title" htmlFor="name">名前</label>
            <input id="name" type="text" value={formData.name} onChange={handleChange} style={{width:'100%',padding:'10px',border:'1px solid #eee',borderRadius:'6px',marginTop:'6px',marginBottom:'12px'}} />
            <label className="admin-stats-title" htmlFor="description">説明</label>
            <textarea id="description" value={formData.description} onChange={handleChange} style={{width:'100%',padding:'10px',border:'1px solid #eee',borderRadius:'6px',marginTop:'6px',marginBottom:'12px'}} rows={2} />
            <label className="admin-stats-title" htmlFor="personalityPrompt">性格プロンプト</label>
            <input id="personalityPrompt" type="text" value={formData.personalityPrompt} onChange={handleChange} style={{width:'100%',padding:'10px',border:'1px solid #eee',borderRadius:'6px',marginTop:'6px',marginBottom:'12px'}} />
          </div>
          <div style={{marginBottom:'24px'}}>
            <div className="admin-stats-title">設定</div>
            <label style={{marginRight:'16px'}}><input type="checkbox" id="isPremium" checked={formData.isPremium} onChange={handleChange} /> プレミアムキャラクター</label>
            <label style={{marginRight:'16px'}}><input type="checkbox" id="isLimited" checked={formData.isLimited} onChange={handleChange} /> 限定</label>
            <label style={{marginRight:'16px', display: 'flex', alignItems: 'center'}}>
              <span style={{marginRight: '8px'}}>有効/無効</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </label>
          </div>
          <div className="admin-card-section">
            <div className="admin-stats-title">画像・音声アップロード</div>
            
            <div className="image-upload-section">
              <label>キャラクター選択画面用画像 (238px x 260px)</label>
              <div className="input-file-wrapper">
                <input 
                  type="file" 
                  id="characterSelect" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'characterSelect')} 
                  style={{ display: 'none' }} 
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('characterSelect').click()}
                >
                  ファイルを選択
                </Button>
              </div>
              {formData.imageCharacterSelect && (
                <div className="input-preview">
                  <img src={formData.imageCharacterSelect} alt="キャラクター選択プレビュー" className="image-upload-preview" />
                </div>
              )}
            </div>
            
            <div className="image-upload-section">
              <label>ダッシュボード用画像 (320px x 528px)</label>
              <div className="input-file-wrapper">
                <input 
                  type="file" 
                  id="dashboard" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'dashboard')} 
                  style={{ display: 'none' }} 
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('dashboard').click()}
                >
                  ファイルを選択
                </Button>
              </div>
              {formData.imageDashboard && (
                <div className="input-preview">
                  <img src={formData.imageDashboard} alt="ダッシュボードプレビュー" className="image-upload-preview" />
                </div>
              )}
            </div>
            
            <div className="image-upload-section">
              <label>チャット背景画像 (455px x 745px)</label>
              <div className="input-file-wrapper">
                <input 
                  type="file" 
                  id="chatBackground" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'chatBackground')} 
                  style={{ display: 'none' }} 
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('chatBackground').click()}
                >
                  ファイルを選択
                </Button>
              </div>
              {formData.imageChatBackground && (
                <div className="input-preview">
                  <img src={formData.imageChatBackground} alt="チャット背景プレビュー" className="image-upload-preview" />
                </div>
              )}
            </div>
            
            <div className="image-upload-section">
              <label>AIキャラアイコン (400px x 400px)</label>
              <div className="input-file-wrapper">
                <input 
                  type="file" 
                  id="chatAvatar" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'chatAvatar')} 
                  style={{ display: 'none' }} 
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('chatAvatar').click()}
                >
                  ファイルを選択
                </Button>
              </div>
              {formData.imageChatAvatar && (
                <div className="input-preview">
                  <img src={formData.imageChatAvatar} alt="AIアイコンプレビュー" className="image-upload-preview" />
                </div>
              )}
            </div>
            
            <div className="image-upload-section">
              <label>サンプルボイス</label>
              <div className="input-file-wrapper">
                <input 
                  type="file" 
                  id="sampleVoiceUrl" 
                  accept="audio/*" 
                  onChange={(e) => handleImageUpload(e, 'sampleVoiceUrl')} 
                  style={{ display: 'none' }} 
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('sampleVoiceUrl').click()}
                >
                  ファイルを選択
                </Button>
              </div>
              {uploadStatus.voice && <div className="upload-status">{uploadStatus.voice}</div>}
              {formData.sampleVoiceUrl && (
                <div className="input-preview">
                  <audio controls src={formData.sampleVoiceUrl} style={{ marginTop: '8px' }}></audio>
                </div>
              )}
            </div>
          </div>
          <div style={{marginTop:'32px', width:'100%', display:'flex', gap:'16px', justifyContent:'center', alignItems:'center'}}>
            <button type="button" onClick={()=>router.push('/admin/characters')} className="admin-logout-btn" style={{background:'#eee',color:'#7b1fa2'}}>キャンセル</button>
            <button type="submit" className="admin-logout-btn" style={{background:'#43eafc',color:'#fff',fontWeight:'bold'}}>作成</button>
          </div>
        </form>
      </div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
      
      {/* 画像トリミングモーダル */}
      {showCropper && selectedImage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>画像のトリミング</h3>
            <ImageCropper 
              image={selectedImage}
              cropWidth={imageType === 'characterSelect' ? 238 : imageType === 'dashboard' ? 320 : imageType === 'chatBackground' ? 455 : 400}
              cropHeight={imageType === 'characterSelect' ? 260 : imageType === 'dashboard' ? 528 : imageType === 'chatBackground' ? 745 : 400}
              onCropComplete={handleCropComplete}
            />
            <Button onClick={() => setShowCropper(false)} type="button">キャンセル</Button>
          </div>
        </div>
      )}
    </div>
  );
}
