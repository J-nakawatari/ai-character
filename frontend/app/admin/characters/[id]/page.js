'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Card from '@/components/Card';
import ImageCropper from '@/components/ImageCropper';

export default function CharacterEditPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageType, setImageType] = useState('');
  const [aspect, setAspect] = useState('1:1');
  const imageSizes = {
    characterSelect: { width: 238, height: 260 },
    dashboard: { width: 320, height: 528 },
    chatBackground: { width: 455, height: 745 },
    chatAvatar: { width: 400, height: 400 }
  };
  const [cropSize, setCropSize] = useState(imageSizes['characterSelect']);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await api.get(`/admin/characters/${params.id}`);
        setCharacter(res.data);
      } catch (err) {
        setError('データ取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', JSON.stringify(character.name));
      fd.append('description', JSON.stringify(character.description));
      fd.append('personality', character.personality || '');
      fd.append('personalityPrompt', JSON.stringify(character.personalityPrompt));
      fd.append('adminPrompt', JSON.stringify(character.adminPrompt));
      fd.append('characterAccessType', character.characterAccessType);
      fd.append('price', character.price);
      fd.append('purchaseType', character.purchaseType);
      fd.append('voice', character.voice);
      fd.append('defaultMessage', JSON.stringify(character.defaultMessage));
      fd.append('themeColor', character.themeColor);
      fd.append('isActive', character.isActive);
      fd.append('imageCharacterSelect', character.imageCharacterSelect || '');
      fd.append('imageDashboard', character.imageDashboard || '');
      fd.append('imageChatBackground', character.imageChatBackground || '');
      fd.append('imageChatAvatar', character.imageChatAvatar || '');
      fd.append('sampleVoiceUrl', character.sampleVoiceUrl || '');
      fd.append('limitMessage', JSON.stringify(character.limitMessage || {}));
      
      // ギャラリー画像を追加
      for (let i = 1; i <= 10; i++) {
        fd.append(`galleryImage${i}`, character[`galleryImage${i}`] || '');
      }

      await api.put(`/admin/characters/${params.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      router.push(`/admin/characters/${params.id}/detail`);
    } catch (err) {
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (field, subfield, value) => {
    setCharacter(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下である必要があります');
      return;
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setImageType(type);
        setCropSize(imageSizes[type]);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }
  };

  const handleCropComplete = async (blob, dataUrl) => {
    setShowCropper(false);
    const file = new File([blob], `upload_${Date.now()}.jpg`, { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/admin/characters/upload/image', formData);
      console.log('アップロード結果', imageType, res.data.imageUrl);
      if (imageType === 'characterSelect') {
        setCharacter(prev => ({ ...prev, imageCharacterSelect: res.data.imageUrl }));
      } else if (imageType === 'dashboard') {
        setCharacter(prev => ({ ...prev, imageDashboard: res.data.imageUrl }));
      } else if (imageType === 'chatBackground') {
        setCharacter(prev => ({ ...prev, imageChatBackground: res.data.imageUrl }));
      } else if (imageType === 'chatAvatar') {
        setCharacter(prev => ({ ...prev, imageChatAvatar: res.data.imageUrl }));
      } else if (imageType.startsWith('gallery')) {
        const galleryField = `galleryImage${imageType.replace('gallery', '')}`;
        setCharacter(prev => ({ ...prev, [galleryField]: res.data.imageUrl }));
      }
    } catch (err) {
      setError('画像のアップロードに失敗しました');
    }
  };

  if (loading) return <div className="admin-content">読み込み中...</div>;
  if (error) return <div className="admin-content admin-error-message">{error}</div>;
  if (!character) return null;

  return (
    <div className="admin-content">
      {/* ヘッダー */}
      <div style={{
        marginBottom: '2rem',
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{flex: 1}}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 0.5rem 0'
            }}>キャラクター編集</h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: character.characterAccessType === 'free' ? 
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                  character.characterAccessType === 'subscription' ?
                  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                  'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white'
              }}>
                {character.characterAccessType === 'free' ? '無料' :
                 character.characterAccessType === 'subscription' ? 'サブスク' : '買い切り'}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: character.isActive ? 
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white'
              }}>
                {character.isActive ? '✅ 有効' : '❌ 無効'}
              </span>
              <span style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                ID: {params.id}
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => router.push(`/admin/characters/${params.id}/detail`)}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >詳細に戻る</button>
            <button 
              onClick={() => router.push('/admin/characters')}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >一覧に戻る</button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="admin-content-wrapper" style={{maxWidth:1200, margin:'0 auto'}}>

        {/* 基本情報カード */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{fontSize: '1.5rem'}}>👤</span>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>基本情報</h2>
          </div>
          <div>
            {/* 名前系 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">名前</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                <div className="form-group">
                  <label className="form-label">日本語</label>
                  <input
                    type="text"
                    value={character.name?.ja || ''}
                    onChange={(e) => handleNestedChange('name', 'ja', e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">英語</label>
                  <input
                    type="text"
                    value={character.name?.en || ''}
                    onChange={(e) => handleNestedChange('name', 'en', e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
            {/* 説明系 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">説明</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                <div className="form-group">
                  <label className="form-label">日本語</label>
                  <textarea
                    value={character.description?.ja || ''}
                    onChange={(e) => handleNestedChange('description', 'ja', e.target.value)}
                    className="admin-textarea"
                    rows={4}
                    style={{width:'100%'}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">英語</label>
                  <textarea
                    value={character.description?.en || ''}
                    onChange={(e) => handleNestedChange('description', 'en', e.target.value)}
                    className="admin-textarea"
                    rows={4}
                    style={{width:'100%'}}
                  />
                </div>
              </div>
            </div>
            {/* その他 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">その他</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                <div className="form-group">
                  <label className="form-label">性格</label>
                  <input
                    type="text"
                    value={character.personality || ''}
                    onChange={(e) => handleChange('personality', e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">テーマカラー</label>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input
                      type="color"
                      value={character.themeColor || '#000000'}
                      onChange={(e) => handleChange('themeColor', e.target.value)}
                      style={{width:40, height:40, padding:0, border:'none', borderRadius:8}}
                    />
                    <input
                      type="text"
                      value={character.themeColor || ''}
                      onChange={(e) => handleChange('themeColor', e.target.value)}
                      className="admin-input"
                      style={{flex:1}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 会話設定カード */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{fontSize: '1.5rem'}}>💬</span>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>会話設定</h2>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
            {/* 性格プロンプト - 日本語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇯🇵</span>
                性格プロンプト（日本語）
              </label>
              <textarea
                value={character.personalityPrompt?.ja || ''}
                onChange={(e) => handleNestedChange('personalityPrompt', 'ja', e.target.value)}
                className="admin-textarea"
                rows={6}
                style={{width:'100%'}}
              />
            </div>

            {/* 性格プロンプト - 英語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇺🇸</span>
                性格プロンプト（English）
              </label>
              <textarea
                value={character.personalityPrompt?.en || ''}
                onChange={(e) => handleNestedChange('personalityPrompt', 'en', e.target.value)}
                className="admin-textarea"
                rows={6}
                style={{width:'100%'}}
              />
            </div>

            {/* 管理者プロンプト - 日本語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇯🇵</span>
                管理者プロンプト（日本語）
              </label>
              <textarea
                value={character.adminPrompt?.ja || ''}
                onChange={(e) => handleNestedChange('adminPrompt', 'ja', e.target.value)}
                className="admin-textarea"
                rows={6}
                style={{width:'100%'}}
              />
            </div>

            {/* 管理者プロンプト - 英語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇺🇸</span>
                管理者プロンプト（English）
              </label>
              <textarea
                value={character.adminPrompt?.en || ''}
                onChange={(e) => handleNestedChange('adminPrompt', 'en', e.target.value)}
                className="admin-textarea"
                rows={6}
                style={{width:'100%'}}
              />
            </div>

            {/* デフォルトメッセージ - 日本語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇯🇵</span>
                デフォルトメッセージ（日本語）
              </label>
              <textarea
                value={character.defaultMessage?.ja || ''}
                onChange={(e) => handleNestedChange('defaultMessage', 'ja', e.target.value)}
                className="admin-textarea"
                rows={4}
                style={{width:'100%'}}
              />
            </div>

            {/* デフォルトメッセージ - 英語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇺🇸</span>
                デフォルトメッセージ（English）
              </label>
              <textarea
                value={character.defaultMessage?.en || ''}
                onChange={(e) => handleNestedChange('defaultMessage', 'en', e.target.value)}
                className="admin-textarea"
                rows={4}
                style={{width:'100%'}}
              />
            </div>

            {/* 制限メッセージ - 日本語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇯🇵</span>
                制限メッセージ（日本語）
              </label>
              <textarea
                value={character.limitMessage?.ja || ''}
                onChange={(e) => handleNestedChange('limitMessage', 'ja', e.target.value)}
                className="admin-textarea"
                rows={4}
                placeholder="今日はもうお話しできないよ。また明日ね。"
                style={{width:'100%'}}
              />
            </div>

            {/* 制限メッセージ - 英語 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🇺🇸</span>
                制限メッセージ（English）
              </label>
              <textarea
                value={character.limitMessage?.en || ''}
                onChange={(e) => handleNestedChange('limitMessage', 'en', e.target.value)}
                className="admin-textarea"
                rows={4}
                placeholder="Looks like we can't chat anymore today. Let's talk tomorrow!"
                style={{width:'100%'}}
              />
            </div>

            {/* 音声設定 */}
            <div className="form-group">
              <label className="form-label">
                <span style={{marginRight: '8px'}}>🎵</span>
                音声設定
              </label>
              <input
                type="text"
                value={character.voice || ''}
                onChange={(e) => handleChange('voice', e.target.value)}
                className="admin-input"
                style={{width:'100%'}}
              />
            </div>
          </div>
        </div>

        {/* 販売情報カード */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{fontSize: '1.5rem'}}>💰</span>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>販売情報</h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">価格設定</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">購入タイプ</div>
                  <select
                    value={character.purchaseType || 'buy'}
                    onChange={(e) => handleChange('purchaseType', e.target.value)}
                    className="admin-select"
                  >
                    <option value="buy">買い切り</option>
                    <option value="rent">レンタル</option>
                    <option value="subscription">サブスクリプション</option>
                  </select>
                </div>
                <div>
                  <div className="character-detail-label">価格</div>
                  <input
                    type="number"
                    value={character.price || 0}
                    onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                    className="admin-input"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メディア情報カード */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{fontSize: '1.5rem'}}>🎨</span>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>メディア情報</h2>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:32}}>
            {/* 基本画像セクション */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">基本画像</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">キャラクター選択画像</div>
                  <div className="admin-image-upload">
                    {character.imageCharacterSelect ? (
                      <img src={character.imageCharacterSelect} alt="select" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'characterSelect')}
                      className="admin-file-input"
                    />
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">ダッシュボード画像</div>
                  <div className="admin-image-upload">
                    {character.imageDashboard ? (
                      <img src={character.imageDashboard} alt="dashboard" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'dashboard')}
                      className="admin-file-input"
                    />
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">チャット背景画像</div>
                  <div className="admin-image-upload">
                    {character.imageChatBackground ? (
                      <img src={character.imageChatBackground} alt="bg" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'chatBackground')}
                      className="admin-file-input"
                    />
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">チャットアバター画像</div>
                  <div className="admin-image-upload">
                    {character.imageChatAvatar ? (
                      <img src={character.imageChatAvatar} alt="avatar" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'chatAvatar')}
                      className="admin-file-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">音声</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">サンプル音声</div>
                  <div className="admin-audio-upload">
                    {character.sampleVoiceUrl ? (
                      <audio src={character.sampleVoiceUrl} controls style={{maxWidth:300}} />
                    ) : (
                      <div style={{padding:12, background:'#f3f4f6', borderRadius:8, color:'#64748b'}}>未設定</div>
                    )}
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('sampleVoice', file);
                          try {
                            const res = await api.post('/admin/characters/upload/voice', formData);
                            handleChange('sampleVoiceUrl', res.data.voiceUrl);
                          } catch (err) {
                            setError('音声のアップロードに失敗しました');
                          }
                        }
                      }}
                      className="admin-file-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* ギャラリー画像セクション */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">ダッシュボードギャラリー（10枚）</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20}}>
                {Array.from({length: 10}, (_, index) => (
                  <div key={index} style={{textAlign:'center'}}>
                    <div className="character-detail-label">ギャラリー画像 {index + 1}</div>
                    <div className="admin-image-upload">
                      {character[`galleryImage${index + 1}`] ? (
                        <img 
                          src={character[`galleryImage${index + 1}`]} 
                          alt={`gallery-${index + 1}`} 
                          style={{width:150, height:150, borderRadius:12, objectFit:'cover', background:'#f3f4f6'}} 
                        />
                      ) : (
                        <div style={{
                          width:150, 
                          height:150, 
                          borderRadius:12, 
                          background:'#f3f4f6', 
                          display:'flex', 
                          alignItems:'center', 
                          justifyContent:'center', 
                          color:'#64748b',
                          fontSize:'0.875rem',
                          textAlign:'center',
                          border: '2px dashed #d1d5db'
                        }}>
                          画像{index + 1}<br/>未設定
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, `gallery${index + 1}`)}
                        className="admin-file-input"
                        style={{marginTop: 8}}
                      />
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: 4,
                        textAlign: 'center'
                      }}>
                        推奨: 400x400px
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#f0f9ff',
                borderRadius: 8,
                border: '1px solid #0ea5e9',
                fontSize: '0.875rem',
                color: '#0369a1'
              }}>
                💡 ヒント: ギャラリー画像は親密度レベルに応じてユーザーダッシュボードで段階的に解放されます
              </div>
            </div>
          </div>
        </div>

        {/* Cropperモーダル */}
        {showCropper && selectedImage && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(36,41,51,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:18,boxShadow:'0 8px 32px rgba(67,234,252,0.10), 0 4px 16px rgba(35,46,67,0.10)',padding:32,minWidth:cropSize.width+100,maxWidth:'95vw',display:'flex',flexDirection:'column',alignItems:'center'}}>
              <h3 style={{fontSize:'1.25rem',fontWeight:'bold',marginBottom:18,color:'#232e43'}}>画像のトリミング</h3>
              <div style={{marginBottom:16}}>
                <span style={{fontSize:13,color:'#6b7280'}}>推奨サイズ: {cropSize.width} x {cropSize.height}px</span>
              </div>
              <ImageCropper
                image={selectedImage}
                cropWidth={cropSize.width}
                cropHeight={cropSize.height}
                onCropComplete={handleCropComplete}
                saveButtonText="切り抜いて保存"
                cancelButtonText="キャンセル"
                onCancel={() => setShowCropper(false)}
              />
            </div>
          </div>
        )}

        {/* 保存ボタン */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '2rem',
          marginBottom: '3rem'
        }}>
          <button 
            type="submit" 
            disabled={saving}
            style={{
              background: saving ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '16px 48px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              transform: saving ? 'none' : 'translateY(0)',
              boxShadow: saving ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.2)';
              }
            }}
          >
            {saving ? '💾 保存中...' : '💾 保存'}
          </button>
        </div>
      </form>
    </div>
  );
} 