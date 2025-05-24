'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Card from '@/components/Card';

export default function CharacterEditPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
      await api.put(`/admin/characters/${params.id}`, character);
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

  if (loading) return <div className="admin-content">読み込み中...</div>;
  if (error) return <div className="admin-content admin-error-message">{error}</div>;
  if (!character) return null;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 className="admin-dashboard-title">キャラクター編集</h1>
          <div style={{display:'flex', gap:12}}>
            <button className="admin-button" onClick={() => router.push(`/admin/characters/${params.id}/detail`)}>詳細に戻る</button>
            <button className="admin-button admin-button--danger" onClick={() => router.push('/admin/characters')}>一覧に戻る</button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="admin-content-wrapper" style={{maxWidth:900, margin:'0 auto'}}>
        {/* ステータスバー */}
        <div style={{display:'flex', gap:12, marginBottom:24}}>
          <div className="form-group" style={{flex:1, minWidth:180}}>
            <label className="form-label">タイプ</label>
            <select 
              value={character.characterType} 
              onChange={(e) => handleChange('characterType', e.target.value)}
              className="admin-select"
            >
              <option value="free">無料</option>
              <option value="premium">プレミアム</option>
              <option value="paid">有料</option>
            </select>
          </div>
          <div className="form-group" style={{flex:1, minWidth:120, marginTop:28}}>
            <label className="form-label" style={{marginBottom:0}}>　</label>
            <label className="admin-checkbox">
              <input 
                type="checkbox" 
                checked={character.isActive} 
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
              <span>有効</span>
            </label>
          </div>
        </div>

        {/* 基本情報カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title form-title" style={{marginBottom:24}}>基本情報</h2>
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
        </Card>

        {/* 会話設定カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>会話設定</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">プロンプト</h3>
              <div>
                <div className="form-group">
                  <label className="form-label">性格プロンプト（日本語）</label>
                  <textarea
                    value={character.personalityPrompt?.ja || ''}
                    onChange={(e) => handleNestedChange('personalityPrompt', 'ja', e.target.value)}
                    className="admin-textarea"
                    rows={6}
                    style={{width:'100%'}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">性格プロンプト（英語）</label>
                  <textarea
                    value={character.personalityPrompt?.en || ''}
                    onChange={(e) => handleNestedChange('personalityPrompt', 'en', e.target.value)}
                    className="admin-textarea"
                    rows={6}
                    style={{width:'100%'}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">管理者プロンプト（日本語）</label>
                  <textarea
                    value={character.adminPrompt?.ja || ''}
                    onChange={(e) => handleNestedChange('adminPrompt', 'ja', e.target.value)}
                    className="admin-textarea"
                    rows={6}
                    style={{width:'100%'}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">管理者プロンプト（英語）</label>
                  <textarea
                    value={character.adminPrompt?.en || ''}
                    onChange={(e) => handleNestedChange('adminPrompt', 'en', e.target.value)}
                    className="admin-textarea"
                    rows={6}
                    style={{width:'100%'}}
                  />
                </div>
              </div>
            </div>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">メッセージ設定</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">デフォルトメッセージ（日本語）</div>
                  <textarea
                    value={character.defaultMessage?.ja || ''}
                    onChange={(e) => handleNestedChange('defaultMessage', 'ja', e.target.value)}
                    className="admin-textarea"
                    rows={4}
                  />
                </div>
                <div>
                  <div className="character-detail-label">デフォルトメッセージ（英語）</div>
                  <textarea
                    value={character.defaultMessage?.en || ''}
                    onChange={(e) => handleNestedChange('defaultMessage', 'en', e.target.value)}
                    className="admin-textarea"
                    rows={4}
                  />
                </div>
                <div>
                  <div className="character-detail-label">音声設定</div>
                  <input
                    type="text"
                    value={character.voice || ''}
                    onChange={(e) => handleChange('voice', e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 販売情報カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>販売情報</h2>
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
        </Card>

        {/* メディア情報カード */}
        <Card className="admin-stats-card-wrapper">
          <h2 className="admin-stats-title" style={{marginBottom:24}}>メディア情報</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">画像</h3>
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
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await api.post('/admin/characters/upload/image', formData);
                            handleChange('imageCharacterSelect', res.data.imageUrl);
                          } catch (err) {
                            setError('画像のアップロードに失敗しました');
                          }
                        }
                      }}
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
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await api.post('/admin/characters/upload/image', formData);
                            handleChange('imageDashboard', res.data.imageUrl);
                          } catch (err) {
                            setError('画像のアップロードに失敗しました');
                          }
                        }
                      }}
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
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await api.post('/admin/characters/upload/image', formData);
                            handleChange('imageChatBackground', res.data.imageUrl);
                          } catch (err) {
                            setError('画像のアップロードに失敗しました');
                          }
                        }
                      }}
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
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await api.post('/admin/characters/upload/image', formData);
                            handleChange('imageChatAvatar', res.data.imageUrl);
                          } catch (err) {
                            setError('画像のアップロードに失敗しました');
                          }
                        }
                      }}
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
          </div>
        </Card>

        {/* 保存ボタン */}
        <div style={{display:'flex', justifyContent:'center', marginTop:32, marginBottom:48}}>
          <button 
            type="submit" 
            className="admin-button admin-button--edit"
            disabled={saving}
            style={{padding:'12px 48px', fontSize:16}}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
} 