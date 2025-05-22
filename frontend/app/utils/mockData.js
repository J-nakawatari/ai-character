export const mockCharacters = [
  {
    _id: 'char001',
    name: {
      ja: 'アイ',
      en: 'Ai'
    },
    description: {
      ja: '優しく知的なAIアシスタント。あなたの質問に丁寧に答えます。',
      en: 'A kind and intelligent AI assistant. Will answer your questions politely.'
    },
    personality: '優しい, 知的, 丁寧',
    personalityPrompt: {
      ja: '優しい, 知的, 丁寧',
      en: 'kind, intelligent, polite'
    },
    imageCharacterSelect: '/images/default.png',
    sampleVoiceUrl: '/voice/voice_01.wav',
    isActive: true
  },
  {
    _id: 'char002',
    name: {
      ja: 'ロボ太',
      en: 'Robota'
    },
    description: {
      ja: '機械的で効率重視のロボット。事実に基づいた回答を提供します。',
      en: 'A mechanical and efficiency-focused robot. Provides fact-based answers.'
    },
    personality: '論理的, 効率的, 正確',
    personalityPrompt: {
      ja: '論理的, 効率的, 正確',
      en: 'logical, efficient, accurate'
    },
    imageCharacterSelect: '/images/default.png',
    sampleVoiceUrl: '/voice/voice_02.wav',
    isActive: true
  },
  {
    _id: 'char003',
    name: {
      ja: 'ミミ',
      en: 'Mimi'
    },
    description: {
      ja: '明るく元気なキャラクター。会話を楽しくします。',
      en: 'A bright and energetic character. Makes conversations fun.'
    },
    personality: '明るい, 元気, フレンドリー',
    personalityPrompt: {
      ja: '明るい, 元気, フレンドリー',
      en: 'bright, energetic, friendly'
    },
    imageCharacterSelect: '/images/default.png',
    sampleVoiceUrl: '/voice/voice_03.wav',
    isActive: true
  },
  {
    _id: 'char004',
    name: {
      ja: 'シンクロン',
      en: 'Synchron'
    },
    description: {
      ja: '冷静で分析的なAI。複雑な問題を解決します。',
      en: 'A calm and analytical AI. Solves complex problems.'
    },
    personality: '冷静, 分析的, 論理的',
    personalityPrompt: {
      ja: '冷静, 分析的, 論理的',
      en: 'calm, analytical, logical'
    },
    imageCharacterSelect: '/images/default.png',
    sampleVoiceUrl: '/voice/voice_04.wav',
    isActive: true
  }
];

export const mockUser = {
  _id: 'user001',
  name: 'テストユーザー',
  email: 'test@example.com',
  hasCompletedSetup: false,
  selectedCharacter: null,
  preferredLanguage: 'ja',
  purchasedCharacters: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockCompleteSetup = async (data) => {
  console.log('Mock completeSetup called with:', data);
  return {
    success: true,
    user: {
      ...mockUser,
      name: data.name,
      selectedCharacter: mockCharacters.find(c => c._id === data.characterId),
      hasCompletedSetup: true
    }
  };
};
