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
  
  // ギャラリー画像（ダッシュボード用）
  galleryImages: [{
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
    title: {
      ja: {
        type: String,
        default: ''
      },
      en: {
        type: String,
        default: ''
      }
    },
    description: {
      ja: {
        type: String,
        default: ''
      },
      en: {
        type: String,
        default: ''
      }
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    tags: [{
      type: String
    }],
    isDefault: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 親密度設定
  affinitySettings: {
    maxLevel: {
      type: Number,
      default: 100
    },
    experienceMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 5.0
    },
    decayRate: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1.0
    },
    decayThreshold: {
      type: Number,
      default: 7,
      min: 1
    },
    levelUpBonuses: [{
      level: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      },
      bonusType: {
        type: String,
        enum: ['image_unlock', 'special_message', 'feature_unlock', 'gift_bonus'],
        required: true
      },
      value: {
        type: String,
        default: ''
      }
    }]
  },
  
  // レベル別報酬
  levelRewards: [{
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    rewardType: {
      type: String,
      enum: ['image', 'voice', 'message', 'feature'],
      required: true
    },
    rewardId: {
      type: String,
      required: true
    },
    title: {
      ja: {
        type: String,
        default: ''
      },
      en: {
        type: String,
        default: ''
      }
    },
    description: {
      ja: {
        type: String,
        default: ''
      },
      en: {
        type: String,
        default: ''
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // 特別メッセージ
  specialMessages: [{
    triggerType: {
      type: String,
      enum: ['level_up', 'first_meeting', 'birthday', 'anniversary', 'gift_received', 'daily_login', 'milestone'],
      required: true
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    condition: {
      type: String,
      default: ''
    },
    message: {
      ja: {
        type: String,
        required: true
      },
      en: {
        type: String,
        default: ''
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    }
  }],
  
  // ギフト設定
  giftPreferences: [{
    giftType: {
      type: String,
      required: true
    },
    preference: {
      type: String,
      enum: ['loves', 'likes', 'neutral', 'dislikes', 'hates'],
      default: 'neutral'
    },
    affinityBonus: {
      type: Number,
      default: 0,
      min: -10,
      max: 20
    },
    experienceBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    specialResponse: {
      ja: {
        type: String,
        default: ''
      },
      en: {
        type: String,
        default: ''
      }
    }
  }],
  
  // 統計・メタデータ
  affinityStats: {
    totalUsers: {
      type: Number,
      default: 0
    },
    averageLevel: {
      type: Number,
      default: 0
    },
    maxLevelUsers: {
      type: Number,
      default: 0
    },
    lastStatsUpdate: {
      type: Date,
      default: Date.now
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Character', CharacterSchema);
