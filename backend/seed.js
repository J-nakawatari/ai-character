const mongoose = require('mongoose');
require('dotenv').config();
const Character = require('./models/Character');

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const characters = [
  {
    name: { ja: 'Miko', en: 'Miko' },
    description: {
      ja: 'A friendly AI assistant with a calm and helpful personality.',
      en: 'A friendly AI assistant with a calm and helpful personality.'
    },
    personality: 'Calm, helpful, and friendly',
    personalityPrompt: { ja: '', en: '' },
    adminPrompt: { ja: '', en: '' },
    characterType: 'free',
    price: 0,
    purchaseType: 'buy',
    voice: '',
    defaultMessage: { ja: '', en: '' },
    themeColor: '#000000',
    isActive: true,
    imageCharacterSelect: '/characters/miko.png',
    imageDashboard: '',
    imageChatBackground: '',
    imageChatAvatar: '',
    sampleVoiceUrl: ''
  },
  {
    name: { ja: 'Robo', en: 'Robo' },
    description: {
      ja: 'A robot-like AI character with logical thinking and precise answers.',
      en: 'A robot-like AI character with logical thinking and precise answers.'
    },
    personality: 'Logical, precise, and technical',
    personalityPrompt: { ja: '', en: '' },
    adminPrompt: { ja: '', en: '' },
    characterType: 'free',
    price: 0,
    purchaseType: 'buy',
    voice: '',
    defaultMessage: { ja: '', en: '' },
    themeColor: '#000000',
    isActive: true,
    imageCharacterSelect: '/characters/robo.png',
    imageDashboard: '',
    imageChatBackground: '',
    imageChatAvatar: '',
    sampleVoiceUrl: ''
  },
  {
    name: { ja: 'Luna', en: 'Luna' },
    description: {
      ja: 'A cheerful AI companion with a bubbly personality and creative thinking.',
      en: 'A cheerful AI companion with a bubbly personality and creative thinking.'
    },
    personality: 'Cheerful, creative, and engaging',
    personalityPrompt: { ja: '', en: '' },
    adminPrompt: { ja: '', en: '' },
    characterType: 'free',
    price: 0,
    purchaseType: 'buy',
    voice: '',
    defaultMessage: { ja: '', en: '' },
    themeColor: '#000000',
    isActive: true,
    imageCharacterSelect: '/characters/luna.png',
    imageDashboard: '',
    imageChatBackground: '',
    imageChatAvatar: '',
    sampleVoiceUrl: ''
  },
  {
    name: { ja: 'Zen', en: 'Zen' },
    description: {
      ja: 'A wise AI mentor with philosophical insights and thoughtful advice.',
      en: 'A wise AI mentor with philosophical insights and thoughtful advice.'
    },
    personality: 'Wise, thoughtful, and philosophical',
    personalityPrompt: { ja: '', en: '' },
    adminPrompt: { ja: '', en: '' },
    characterType: 'free',
    price: 0,
    purchaseType: 'buy',
    voice: '',
    defaultMessage: { ja: '', en: '' },
    themeColor: '#000000',
    isActive: true,
    imageCharacterSelect: '/characters/zen.png',
    imageDashboard: '',
    imageChatBackground: '',
    imageChatAvatar: '',
    sampleVoiceUrl: ''
  }
];

const seedCharacters = async () => {
  try {
    await Character.deleteMany({});

    for (const char of characters) {
      await Character.create(char);
    }
    
    console.log('✅ Characters seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding characters:', err);
    process.exit(1);
  }
};

seedCharacters();
