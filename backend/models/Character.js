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
  characterAccessType: {
    type: String,
    enum: ['free', 'subscription', 'purchaseOnly'],
    default: 'free',
  },
  price: {
    type: Number,
    default: 0
  },
  purchaseType: {
    type: String,
    enum: ['buy'],
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
  limitMessage: {
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
  images: [{
    url: {
      type: String,
      required: true
    },
    unlockLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Character', CharacterSchema);
