const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  hasCompletedSetup: {
    type: Boolean,
    default: false
  },
  selectedCharacter: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  membershipType: {
    type: String,
    enum: ['free', 'subscription'],
    default: 'free'
  },
  preferredLanguage: {
    type: String,
    enum: ['ja', 'en'],
    default: 'ja'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'canceled'],
    default: 'inactive'
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  purchasedCharacters: [{
    character: {
      type: Schema.Types.ObjectId,
      ref: 'Character'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    purchaseType: {
      type: String,
      enum: ['buy', 'subscription'],
      default: 'buy'
    }
  }],
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addOnSubscriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  affinities: [{
    character: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastInteractedAt: {
      type: Date,
      default: Date.now
    },
    lastVisitStreak: {
      type: Number,
      default: 0
    },
    decayStartAt: {
      type: Date,
      default: null
    },
    
    // 拡張親密度フィールド
    emotionalState: {
      type: String,
      enum: ['happy', 'normal', 'sad', 'excited', 'angry', 'shy', 'loving', 'curious', 'worried'],
      default: 'normal'
    },
    relationshipType: {
      type: String,
      enum: ['stranger', 'acquaintance', 'friend', 'close_friend', 'best_friend', 'lover', 'soulmate'],
      default: 'stranger'
    },
    trustLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    intimacyLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // 経験値・統計
    experience: {
      type: Number,
      default: 0
    },
    totalConversations: {
      type: Number,
      default: 0
    },
    averageConversationLength: {
      type: Number,
      default: 0
    },
    conversationsToday: {
      type: Number,
      default: 0
    },
    
    // 活動履歴
    firstInteractionAt: {
      type: Date,
      default: null
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    maxStreak: {
      type: Number,
      default: 0
    },
    lastGiftGivenAt: {
      type: Date,
      default: null
    },
    
    // ユーザー設定・記憶
    nickname: {
      type: String,
      default: ''
    },
    favoriteTopics: [{
      type: String
    }],
    specialMemories: [{
      event: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      importance: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
      }
    }],
    
    // ギフト・アイテム履歴
    giftsReceived: [{
      giftType: {
        type: String,
        required: true
      },
      giftName: {
        type: String,
        required: true
      },
      receivedAt: {
        type: Date,
        default: Date.now
      },
      value: {
        type: Number,
        default: 0
      }
    }],
    totalGiftsValue: {
      type: Number,
      default: 0
    },
    
    // 設定・フラグ
    isFavorite: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    notificationEnabled: {
      type: Boolean,
      default: true
    },
    privacyLevel: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'private'
    },
    
    // メタデータ
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('User', UserSchema);
