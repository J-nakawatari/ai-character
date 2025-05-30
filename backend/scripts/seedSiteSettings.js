require('dotenv').config();
const mongoose = require('mongoose');
const SiteSettings = require('../models/SiteSettings');

const settings = [
  {
    key: 'site_name',
    value: 'キャラクティア',
    type: 'string',
    description: 'サイト名',
    category: 'general',
    isPublic: true
  },
  {
    key: 'site_tagline',
    value: '会いにきて...あなただけの愛(AI）。',
    type: 'string',
    description: 'サイトのキャッチコピー',
    category: 'general',
    isPublic: true
  },
  {
    key: 'default_theme_color',
    value: '#75C6D1',
    type: 'string',
    description: 'デフォルトテーマカラー',
    category: 'theme',
    isPublic: true
  },
  {
    key: 'subscription_price',
    value: 980,
    type: 'number',
    description: 'サブスクリプション価格（円）',
    category: 'pricing',
    isPublic: true
  },
  {
    key: 'default_hero_videos',
    value: [
      '/videos/hero-videos_01.mp4',
      '/videos/hero-videos_02.mp4',
      '/videos/hero-videos_03.mp4'
    ],
    type: 'array',
    description: 'デフォルトヒーロー動画',
    category: 'media',
    isPublic: true
  },
  {
    key: 'default_voice_samples',
    value: [
      '/voice/voice_01.wav',
      '/voice/voice_02.wav',
      '/voice/voice_03.wav',
      '/voice/voice_04.wav',
      '/voice/voice_05.mp3'
    ],
    type: 'array',
    description: 'デフォルト音声サンプル',
    category: 'media',
    isPublic: true
  },
  {
    key: 'default_chat_messages',
    value: [
      '今日は何のお話をする？✨',
      '久しぶり！また会えたね💕',
      'どんな一日だった？🌟',
      'また一緒にお話しよう！',
      '今日も素敵な一日にしようね🌸',
      'あなたと話すと楽しいな😊',
      '何か新しいことあった？',
      'いつでも話しかけてね💫'
    ],
    type: 'array',
    description: 'ホームページのチャットメッセージ',
    category: 'content',
    isPublic: true
  }
];

async function seedSiteSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    for (const setting of settings) {
      await SiteSettings.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, new: true }
      );
      console.log(`✅ ${setting.key} 設定完了`);
    }

    console.log('🎉 サイト設定のシード完了');
    process.exit(0);
  } catch (error) {
    console.error('❌ シードエラー:', error);
    process.exit(1);
  }
}

seedSiteSettings();