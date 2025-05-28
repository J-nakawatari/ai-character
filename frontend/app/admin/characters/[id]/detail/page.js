'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Card from '@/components/Card';

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="admin-content">読み込み中...</div>;
  if (error) return <div className="admin-content admin-error-message">{error}</div>;
  if (!character) return null;

  // バッジ用関数
  const badge = (text, color) => (
    <span style={{background:color, color:'#fff', borderRadius:8, padding:'2px 10px', fontSize:13, marginLeft:8}}>{text}</span>
  );

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 className="admin-dashboard-title">キャラクター詳細</h1>
          <div style={{display:'flex', gap:12}}>
            <button className="admin-button admin-button--edit" onClick={() => router.push(`/admin/characters/${params.id}`)}>編集</button>
            <button className="admin-button admin-button--danger" onClick={() => router.push('/admin/characters')}>一覧に戻る</button>
          </div>
        </div>
      </div>
      <div className="admin-content-wrapper" style={{maxWidth:900, margin:'0 auto'}}>
        {/* ステータスバー */}
        <div style={{display:'flex', gap:12, marginBottom:24}}>
          {badge(character.characterAccessType, character.characterAccessType==='free' ? '#3b82f6' : character.characterAccessType==='subscription' ? '#a21caf' : character.characterAccessType==='purchaseOnly' ? '#eab308' : '#f43f5e')}
          {character.isActive ? badge('有効', '#22c55e') : badge('無効', '#e11d48')}
          <span style={{color:'#64748b', fontSize:14}}>作成日: {character.createdAt ? new Date(character.createdAt).toLocaleString() : '-'}</span>
        </div>

        {/* 基本情報カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>基本情報（{params.id}）</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
            {/* 名前系 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">名前</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">日本語</div>
                  <div className="character-detail-value" style={{fontWeight:'bold', fontSize:18}}>{character.name?.ja}</div>
                </div>
                <div>
                  <div className="character-detail-label">英語</div>
                  <div className="character-detail-value">{character.name?.en}</div>
                </div>
              </div>
            </div>
            {/* 説明系 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">説明</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">日本語</div>
                  <div className="character-detail-value">{character.description?.ja}</div>
                </div>
                <div>
                  <div className="character-detail-label">英語</div>
                  <div className="character-detail-value">{character.description?.en}</div>
                </div>
              </div>
            </div>
            {/* 販売情報 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">販売情報</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">販売種別</div>
                  <div className="character-detail-value">
                    {badge(
                      character.characterAccessType === 'free' ? '無料' :
                      character.characterAccessType === 'subscription' ? 'サブスクリプション' :
                      '買い切り',
                      character.characterAccessType === 'free' ? '#3b82f6' :
                      character.characterAccessType === 'subscription' ? '#a21caf' :
                      '#eab308'
                    )}
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">サブスクリプション状態</div>
                  <div className="character-detail-value">
                    {badge(character.isActive ? '有効' : '無効', character.isActive ? '#22c55e' : '#e11d48')}
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">キャラクター作成日</div>
                  <div className="character-detail-value">
                    {character.createdAt ? new Date(character.createdAt).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            </div>
            {/* その他 */}
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">その他</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">性格</div>
                  <div className="character-detail-value">{character.personality}</div>
                </div>
                <div>
                  <div className="character-detail-label">テーマカラー</div>
                  <div className="character-detail-value">
                    <span style={{display:'inline-block',width:32,height:32,borderRadius:8,background:character.themeColor,marginRight:8,verticalAlign:'middle',border:'1px solid #e5e7eb'}}></span>
                    {character.themeColor}
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
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">性格プロンプト（日本語）</div>
                  <div className="character-detail-value character-detail-value--multiline">{character.personalityPrompt?.ja}</div>
                </div>
                <div>
                  <div className="character-detail-label">性格プロンプト（英語）</div>
                  <div className="character-detail-value character-detail-value--multiline">{character.personalityPrompt?.en}</div>
                </div>
                <div>
                  <div className="character-detail-label">管理者プロンプト（日本語）</div>
                  <div className="character-detail-value character-detail-value--multiline">{character.adminPrompt?.ja}</div>
                </div>
                <div>
                  <div className="character-detail-label">管理者プロンプト（英語）</div>
                  <div className="character-detail-value character-detail-value--multiline">{character.adminPrompt?.en}</div>
                </div>
              </div>
            </div>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">メッセージ設定</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">デフォルトメッセージ（日本語）</div>
                  <div className="character-detail-value character-detail-value--multiline">{character.defaultMessage?.ja}</div>
                </div>
                <div>
                  <div className="character-detail-label">デフォルトメッセージ（英語）</div>
                  <div className="character-detail-value character-detail-value--multiline">{character.defaultMessage?.en}</div>
                </div>
                <div>
                  <div className="character-detail-label">音声設定</div>
                  <div className="character-detail-value">{character.voice}</div>
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
                  <div className="character-detail-value">{character.purchaseType}</div>
                </div>
                <div>
                  <div className="character-detail-label">価格</div>
                  <div className="character-detail-value">{character.price} 円</div>
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
                  <div className="character-detail-value">
                    {character.imageCharacterSelect ? (
                      <img src={character.imageCharacterSelect} alt="select" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">ダッシュボード画像</div>
                  <div className="character-detail-value">
                    {character.imageDashboard ? (
                      <img src={character.imageDashboard} alt="dashboard" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">チャット背景画像</div>
                  <div className="character-detail-value">
                    {character.imageChatBackground ? (
                      <img src={character.imageChatBackground} alt="bg" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="character-detail-label">チャットアバター画像</div>
                  <div className="character-detail-value">
                    {character.imageChatAvatar ? (
                      <img src={character.imageChatAvatar} alt="avatar" style={{width:120, height:120, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />
                    ) : (
                      <div style={{width:120, height:120, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>未設定</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="character-detail-section">
              <h3 className="character-detail-section-title">音声</h3>
              <div className="character-detail-grid">
                <div>
                  <div className="character-detail-label">サンプル音声</div>
                  <div className="character-detail-value">
                    {character.sampleVoiceUrl ? (
                      <audio src={character.sampleVoiceUrl} controls style={{maxWidth:300}} />
                    ) : (
                      <div style={{padding:12, background:'#f3f4f6', borderRadius:8, color:'#64748b'}}>未設定</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function renderValue(value) {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return (
        <ul style={{margin:0,paddingLeft:20}}>
          {value.map((v, i) => <li key={i}>{renderValue(v)}</li>)}
        </ul>
      );
    }
    // オブジェクト（多言語や画像など）
    return (
      <ul style={{margin:0,paddingLeft:20}}>
        {Object.entries(value).map(([k, v]) => (
          <li key={k}><b>{k}:</b> {renderValue(v)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'boolean') {
    return value ? '有効' : '無効';
  }
  if (typeof value === 'string') {
    // 画像URL判定: http(s) or /uploads/images/ で jpg/png/gif など
    if (value.match(/(https?:\/\/|\/uploads\/images\/).+\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={value} alt="img" style={{maxWidth:120}} />;
    }
    if (value.match(/\.(mp3|wav|ogg)$/i)) {
      return <audio src={value} controls style={{maxWidth:200}} />;
    }
    if (value.match(/^https?:\/\//)) {
      return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
    }
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  return String(value);
} 