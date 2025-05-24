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
        <h1 className="admin-dashboard-title">キャラクター詳細</h1>
      </div>
      <div className="admin-content-wrapper" style={{maxWidth:900, margin:'0 auto'}}>
        <button className="admin-button" onClick={() => router.push('/admin/characters')}>一覧に戻る</button>
        {/* 基本情報カード */}
        <Card className="admin-stats-card-wrapper" style={{marginTop:32, marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>基本情報</h2>
          {/* 名前系 */}
          <div style={{marginBottom:16}}>
            <h3 style={{fontSize:16, color:'#64748b', fontWeight:'bold', marginBottom:8}}>名前</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
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
          <div style={{marginBottom:16}}>
            <h3 style={{fontSize:16, color:'#64748b', fontWeight:'bold', marginBottom:8}}>説明</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
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
          {/* その他 */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
            <div>
              <div className="character-detail-label">性格</div>
              <div className="character-detail-value">{character.personality}</div>
            </div>
            <div>
              <div className="character-detail-label">有効/無効</div>
              <div className="character-detail-value">{character.isActive ? badge('有効', '#22c55e') : badge('無効', '#e11d48')}</div>
            </div>
          </div>
        </Card>
        {/* 会話設定カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>会話設定</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
            <div>
              <div className="character-detail-label">性格プロンプト（日本語）</div>
              <div className="character-detail-value">{character.personalityPrompt?.ja}</div>
            </div>
            <div>
              <div className="character-detail-label">性格プロンプト（英語）</div>
              <div className="character-detail-value">{character.personalityPrompt?.en}</div>
            </div>
            <div>
              <div className="character-detail-label">管理者プロンプト（日本語）</div>
              <div className="character-detail-value">{character.adminPrompt?.ja}</div>
            </div>
            <div>
              <div className="character-detail-label">管理者プロンプト（英語）</div>
              <div className="character-detail-value">{character.adminPrompt?.en}</div>
            </div>
            <div>
              <div className="character-detail-label">デフォルトメッセージ（日本語）</div>
              <div className="character-detail-value">{character.defaultMessage?.ja}</div>
            </div>
            <div>
              <div className="character-detail-label">デフォルトメッセージ（英語）</div>
              <div className="character-detail-value">{character.defaultMessage?.en}</div>
            </div>
            <div>
              <div className="character-detail-label">voice</div>
              <div className="character-detail-value">{character.voice}</div>
            </div>
          </div>
        </Card>
        {/* システム設定カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>システム設定</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
            <div>
              <div className="character-detail-label">テーマカラー</div>
              <div className="character-detail-value"><span style={{display:'inline-block',width:32,height:32,borderRadius:8,background:character.themeColor,marginRight:8,verticalAlign:'middle',border:'1px solid #e5e7eb'}}></span>{character.themeColor}</div>
            </div>
          </div>
        </Card>
        {/* 販売情報カード */}
        <Card className="admin-stats-card-wrapper" style={{marginBottom:24}}>
          <h2 className="admin-stats-title" style={{marginBottom:24}}>販売情報</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
            <div>
              <div className="character-detail-label">タイプ</div>
              <div className="character-detail-value">
                {badge(character.characterType, character.characterType==='free' ? '#3b82f6' : character.characterType==='premium' ? '#a21caf' : character.characterType==='paid' ? '#eab308' : '#f43f5e')}
              </div>
            </div>
            <div>
              <div className="character-detail-label">作成日</div>
              <div className="character-detail-value">{character.createdAt ? new Date(character.createdAt).toLocaleString() : '-'}</div>
            </div>
            {/* 購入情報グループ */}
            <div style={{gridColumn:'1/3', marginTop:16}}>
              <h3 style={{fontSize:16, color:'#64748b', fontWeight:'bold', marginBottom:8}}>購入情報</h3>
              <div style={{display:'flex', gap:32}}>
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
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
            <div>
              <div className="character-detail-label">キャラクター選択画像</div>
              <div className="character-detail-value">{character.imageCharacterSelect && <img src={character.imageCharacterSelect} alt="select" style={{width:100, height:100, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />}</div>
            </div>
            <div>
              <div className="character-detail-label">ダッシュボード画像</div>
              <div className="character-detail-value">{character.imageDashboard && <img src={character.imageDashboard} alt="dashboard" style={{width:100, height:100, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />}</div>
            </div>
            <div>
              <div className="character-detail-label">チャット背景画像</div>
              <div className="character-detail-value">{character.imageChatBackground && <img src={character.imageChatBackground} alt="bg" style={{width:100, height:100, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />}</div>
            </div>
            <div>
              <div className="character-detail-label">チャットアバター画像</div>
              <div className="character-detail-value">{character.imageChatAvatar && <img src={character.imageChatAvatar} alt="avatar" style={{width:100, height:100, borderRadius:16, objectFit:'cover', background:'#f3f4f6'}} />}</div>
            </div>
            <div style={{gridColumn:'1/3'}}>
              <div className="character-detail-label">サンプル音声</div>
              <div className="character-detail-value">{character.sampleVoiceUrl && <audio src={character.sampleVoiceUrl} controls style={{maxWidth:300}} />}</div>
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