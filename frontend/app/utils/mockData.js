export const mockCharacters = [
  {
    _id: 'char1',
    name: {
      ja: '優しいアシスタント',
      en: 'Kind Assistant'
    },
    description: {
      ja: '親切で丁寧なアシスタントです。どんな質問にも優しく答えます。',
      en: 'A kind and polite assistant who answers any question with care.'
    },
    personality: '優しい, 丁寧, 知識豊富',
    personalityPrompt: {
      ja: '優しい, 丁寧, 知識豊富',
      en: 'kind, polite, knowledgeable'
    },
    imageCharacterSelect: '/images/character1.png',
    sampleVoiceUrl: '/voice/voice_01.wav'
  },
  {
    _id: 'char2',
    name: {
      ja: '元気なコーチ',
      en: 'Energetic Coach'
    },
    description: {
      ja: 'モチベーションを高めるコーチです。目標達成をサポートします。',
      en: 'A motivational coach who helps you achieve your goals.'
    },
    personality: '元気, ポジティブ, 励まし上手',
    personalityPrompt: {
      ja: '元気, ポジティブ, 励まし上手',
      en: 'energetic, positive, encouraging'
    },
    imageCharacterSelect: '/images/character2.png',
    sampleVoiceUrl: '/voice/voice_02.wav'
  },
  {
    _id: 'char3',
    name: {
      ja: '冷静なアドバイザー',
      en: 'Calm Advisor'
    },
    description: {
      ja: '論理的で冷静なアドバイスを提供します。複雑な問題の解決をサポートします。',
      en: 'Provides logical and calm advice. Supports solving complex problems.'
    },
    personality: '冷静, 論理的, 分析的',
    personalityPrompt: {
      ja: '冷静, 論理的, 分析的',
      en: 'calm, logical, analytical'
    },
    imageCharacterSelect: '/images/character3.png',
    sampleVoiceUrl: '/voice/voice_03.wav'
  },
  {
    _id: 'char4',
    name: {
      ja: '創造的なアーティスト',
      en: 'Creative Artist'
    },
    description: {
      ja: '創造的なアイデアを提供します。芸術や創作活動のインスピレーションになります。',
      en: 'Provides creative ideas. Inspires artistic and creative activities.'
    },
    personality: '創造的, 芸術的, インスピレーション',
    personalityPrompt: {
      ja: '創造的, 芸術的, インスピレーション',
      en: 'creative, artistic, inspirational'
    },
    imageCharacterSelect: '/images/character4.png',
    sampleVoiceUrl: '/voice/voice_04.wav'
  }
];

export const mockUser = {
  _id: 'user1',
  name: 'テストユーザー',
  email: 'test@example.com',
  hasCompletedSetup: false,
  preferredLanguage: 'ja',
  selectedCharacter: null,
  premium: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockChatHistory = [
  {
    _id: 'msg1',
    userId: 'user1',
    characterId: 'char1',
    content: 'こんにちは！',
    sender: 'user',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'msg2',
    userId: 'user1',
    characterId: 'char1',
    content: 'こんにちは！どのようにお手伝いできますか？',
    sender: 'character',
    timestamp: new Date(Date.now() - 3590000).toISOString()
  },
  {
    _id: 'msg3',
    userId: 'user1',
    characterId: 'char1',
    content: '今日の天気を教えてください',
    sender: 'user',
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    _id: 'msg4',
    userId: 'user1',
    characterId: 'char1',
    content: '申し訳ありませんが、リアルタイムの天気情報にはアクセスできません。お住まいの地域の天気予報をチェックすることをお勧めします。他に何かお手伝いできることはありますか？',
    sender: 'character',
    timestamp: new Date(Date.now() - 3490000).toISOString()
  }
];
