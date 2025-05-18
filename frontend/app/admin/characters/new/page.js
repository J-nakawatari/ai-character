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
            <label style={{marginRight:'16px'}}><input type="checkbox" id="isActive" checked={formData.isActive} onChange={handleChange} /> 有効</label>
          </div>
          <div style={{marginBottom:'24px'}}>
            <div className="admin-stats-title">画像</div>
            <div style={{display:'flex',flexDirection:'column',gap:'24px',flexWrap:'wrap'}}>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>キャラクター選択画面用画像</div>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'characterSelect')} />
              </div>
              <div style={{marginBottom:'8px'}}>
                <div style={{marginBottom:'8px'}}>ダッシュボード用画像</div>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'dashboard')} />
              </div>
            </div>
          </div>
          <div style={{marginTop:'32px', width:'100%', display:'flex', gap:'16px', justifyContent:'center', alignItems:'center'}}>
            <button type="button" onClick={()=>router.push('/admin/characters')} className="admin-logout-btn" style={{background:'#eee',color:'#7b1fa2'}}>キャンセル</button>
            <button type="submit" className="admin-logout-btn" style={{background:'#43eafc',color:'#fff',fontWeight:'bold'}}>作成</button>
          </div>
        </form>
      </div>
    </div>
  );
}
