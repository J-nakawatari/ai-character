const mongoose = require('mongoose');

const personalityTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  nameEn: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#75C6D1'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PersonalityTag', personalityTagSchema);