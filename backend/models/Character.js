const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  personalityPrompt: {
    type: String,
    default: ''
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  purchaseType: {
    type: String,
    default: 'buy'
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  voice: {
    type: String,
    default: ''
  },
  defaultMessage: {
    type: String,
    default: ''
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
