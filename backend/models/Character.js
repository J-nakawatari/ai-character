const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
  name: {
    ja: {
      type: String,
      required: true
    },
    en: {
      type: String,
      default: ''
    }
  },
  description: {
    ja: {
      type: String,
      required: true
    },
    en: {
      type: String,
      default: ''
    }
  },
  personality: {
    type: String,
    default: ''
  },
  personalityPrompt: {
    ja: {
      type: String,
      default: ''
    },
    en: {
      type: String,
      default: ''
    }
  },
  adminPrompt: {
    ja: {
      type: String,
      default: ''
    },
    en: {
      type: String,
      default: ''
    }
  },
  characterType: {
    type: String,
    enum: ['free', 'premium', 'paid', 'limited'],
    default: 'free',
  },
  price: {
    type: Number,
    default: 0
  },
  purchaseType: {
    type: String,
    default: 'buy'
  },
  voice: {
    type: String,
    default: ''
  },
  defaultMessage: {
    ja: {
      type: String,
      default: ''
    },
    en: {
      type: String,
      default: ''
    }
  },
  themeColor: {
    type: String,
    default: '#000000'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageCharacterSelect: {
    type: String,
    default: ''
  },
  imageDashboard: {
    type: String,
    default: ''
  },
  imageChatBackground: {
    type: String,
    default: ''
  },
  imageChatAvatar: {
    type: String,
    default: ''
  },
  sampleVoiceUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Character', CharacterSchema);
