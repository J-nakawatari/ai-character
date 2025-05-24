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
    enum: ['free', 'premium'],
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
    default: 'active'
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
  }
});

module.exports = mongoose.model('User', UserSchema);
