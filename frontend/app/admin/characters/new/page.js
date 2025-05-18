'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';

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
  
  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
      
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, image: '' }));
      }, 3000);
      
      return imageUrl;
    } catch (err) {
      console.error('画像アップロードに失敗:', err);
      setUploadStatus({ ...uploadStatus, image: 'アップロード失敗' });
      return null;
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
          <div style={{marginBottom:'24px'}}>
            <div className="admin-stats-title">画像・音声</div>
            <div style={{display:'flex',flexDirection:'column',gap:'24px',flexWrap:'wrap'}}>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>キャラクター選択画面用画像</div>
                {formData.imageCharacterSelect && (
                  <img src={formData.imageCharacterSelect} alt="キャラクター選択画像" style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px',marginBottom:'8px'}} />
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'characterSelect')} />
              </div>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>ダッシュボード用画像</div>
                {formData.imageDashboard && (
                  <img src={formData.imageDashboard} alt="ダッシュボード画像" style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px',marginBottom:'8px'}} />
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'dashboard')} />
              </div>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>チャット背景画像 <span className="chat-bg-character-image"></span></div>
                {formData.imageChatBackground && (
                  <img src={formData.imageChatBackground} alt="チャット背景画像" style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px',marginBottom:'8px'}} />
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'chatBackground')} />
              </div>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>AIキャラアイコン <span className="chat-avatar-user-icon"></span></div>
                {formData.imageChatAvatar && (
                  <img src={formData.imageChatAvatar} alt="AIキャラアイコン" style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px',marginBottom:'8px'}} />
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'chatAvatar')} />
              </div>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>音声サンプル <span className="voiceicon"></span></div>
                {formData.sampleVoiceUrl && (
                  <audio controls style={{marginBottom:'8px'}}>
                    <source src={formData.sampleVoiceUrl} type="audio/mpeg" />
                    お使いのブラウザは音声再生をサポートしていません。
                  </audio>
                )}
                <input type="file" accept="audio/mpeg,audio/mp3" onChange={handleVoiceUpload} />
              </div>
              {uploadStatus.image && (
                <div style={{color: uploadStatus.image.includes('失敗') ? 'red' : 'green'}}>
                  {uploadStatus.image}
                </div>
              )}
              {uploadStatus.voice && (
                <div style={{color: uploadStatus.voice.includes('失敗') ? 'red' : 'green'}}>
                  {uploadStatus.voice}
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
    </div>
  );
}
