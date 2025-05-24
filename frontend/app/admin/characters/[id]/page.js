'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';

const initialState = {
  name: { ja: '', en: '' },
  description: { ja: '', en: '' },
  personality: '',
  personalityPrompt: { ja: '', en: '' },
  adminPrompt: { ja: '', en: '' },
  characterType: 'free',
  price: 0,
  purchaseType: 'buy',
  voice: '',
  defaultMessage: { ja: '', en: '' },
  themeColor: '#000000',
  isActive: true,
  imageCharacterSelect: '',
  imageDashboard: '',
  imageChatBackground: '',
  imageChatAvatar: '',
  sampleVoiceUrl: '',
};

export default function CharacterEditPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await api.get(`/admin/characters/${params.id}`);
        setForm({ ...initialState, ...res.data });
      } catch (err) {
        setError('データ取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [params.id]);

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
      await api.put(`/admin/characters/${params.id}`, form);
      router.push('/admin/characters');
    } catch (err) {
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-content">読み込み中...</div>;

  return (
    <div className="admin-content">
      <h1>キャラクター編集</h1>
      {error && <div className="admin-error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <label>名前（日本語）<input name="name.ja" value={form.name.ja} onChange={handleChange} required /></label>
        <label>名前（英語）<input name="name.en" value={form.name.en} onChange={handleChange} /></label>
        <label>説明（日本語）<textarea name="description.ja" value={form.description.ja} onChange={handleChange} required /></label>
        <label>説明（英語）<textarea name="description.en" value={form.description.en} onChange={handleChange} /></label>
        <label>性格<input name="personality" value={form.personality} onChange={handleChange} /></label>
        <label>性格プロンプト（日本語）<textarea name="personalityPrompt.ja" value={form.personalityPrompt.ja} onChange={handleChange} /></label>
        <label>性格プロンプト（英語）<textarea name="personalityPrompt.en" value={form.personalityPrompt.en} onChange={handleChange} /></label>
        <label>管理者プロンプト（日本語）<textarea name="adminPrompt.ja" value={form.adminPrompt.ja} onChange={handleChange} /></label>
        <label>管理者プロンプト（英語）<textarea name="adminPrompt.en" value={form.adminPrompt.en} onChange={handleChange} /></label>
        <label>タイプ
          <select name="characterType" value={form.characterType} onChange={handleChange}>
            <option value="free">無料</option>
            <option value="premium">プレミアム</option>
            <option value="paid">有料</option>
            <option value="limited">限定</option>
          </select>
        </label>
        <label>価格<input name="price" type="number" value={form.price} onChange={handleChange} /></label>
        <label>購入タイプ
          <select name="purchaseType" value={form.purchaseType} onChange={handleChange}>
            <option value="buy">買い切り</option>
            <option value="subscription">サブスク</option>
          </select>
        </label>
        <label>声<input name="voice" value={form.voice} onChange={handleChange} /></label>
        <label>デフォルトメッセージ（日本語）<textarea name="defaultMessage.ja" value={form.defaultMessage.ja} onChange={handleChange} /></label>
        <label>デフォルトメッセージ（英語）<textarea name="defaultMessage.en" value={form.defaultMessage.en} onChange={handleChange} /></label>
        <label>テーマカラー<input name="themeColor" type="color" value={form.themeColor} onChange={handleChange} /></label>
        <label>有効<input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} /></label>
        <label>イメージキャラクター選択URL<input name="imageCharacterSelect" value={form.imageCharacterSelect} onChange={handleChange} /></label>
        <label>イメージダッシュボードURL<input name="imageDashboard" value={form.imageDashboard} onChange={handleChange} /></label>
        <label>イメージチャット背景URL<input name="imageChatBackground" value={form.imageChatBackground} onChange={handleChange} /></label>
        <label>イメージチャットアバターURL<input name="imageChatAvatar" value={form.imageChatAvatar} onChange={handleChange} /></label>
        <label>サンプル音声URL<input name="sampleVoiceUrl" value={form.sampleVoiceUrl} onChange={handleChange} /></label>
        <div style={{marginTop:16}}>
          <button type="submit" className="admin-button admin-button--primary" disabled={loading}>保存</button>
          <button type="button" className="admin-button" onClick={() => router.push('/admin/characters')}>キャンセル</button>
        </div>
      </form>
    </div>
  );
} 