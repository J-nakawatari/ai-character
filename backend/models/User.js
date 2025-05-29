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
    }
  }]
});

module.exports = mongoose.model('User', UserSchema);
