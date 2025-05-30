require('dotenv').config();
const mongoose = require('mongoose');
const PersonalityTag = require('../models/PersonalityTag');

const personalityTags = [
  { name: '明るい', nameEn: 'Bright', color: '#FFB347', order: 1 },
  { name: '優しい', nameEn: 'Kind', color: '#98D8C8', order: 2 },
  { name: '厳しい', nameEn: 'Strict', color: '#F06292', order: 3 },
  { name: '真面目', nameEn: 'Serious', color: '#6495ED', order: 4 },
  { name: '陽気', nameEn: 'Cheerful', color: '#FFD700', order: 5 },
  { name: '冷静', nameEn: 'Calm', color: '#87CEEB', order: 6 },
  { name: '情熱的', nameEn: 'Passionate', color: '#FF6347', order: 7 },
  { name: '穏やか', nameEn: 'Peaceful', color: '#90EE90', order: 8 },
  { name: '活発', nameEn: 'Active', color: '#FF7F50', order: 9 },
  { name: '慎重', nameEn: 'Cautious', color: '#DDA0DD', order: 10 },
  { name: '大胆', nameEn: 'Bold', color: '#DC143C', order: 11 },
  { name: '繊細', nameEn: 'Delicate', color: '#FFB6C1', order: 12 },
  { name: '強気', nameEn: 'Confident', color: '#FF4500', order: 13 },
  { name: '優雅', nameEn: 'Elegant', color: '#DEB887', order: 14 },
  { name: '知的', nameEn: 'Intelligent', color: '#4169E1', order: 15 },
  { name: '謙虚', nameEn: 'Humble', color: '#8FBC8F', order: 16 },
  { name: '誠実', nameEn: 'Honest', color: '#5F9EA0', order: 17 },
  { name: '勇敢', nameEn: 'Brave', color: '#B22222', order: 18 },
  { name: '忠実', nameEn: 'Loyal', color: '#2E8B57', order: 19 },
  { name: '思いやり', nameEn: 'Caring', color: '#DA70D6', order: 20 },
  { name: '几帳面', nameEn: 'Neat', color: '#708090', order: 21 },
  { name: '自由', nameEn: 'Free', color: '#00CED1', order: 22 },
  { name: '創造的', nameEn: 'Creative', color: '#9370DB', order: 23 }
];

async function seedPersonalityTags() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    for (const tag of personalityTags) {
      await PersonalityTag.findOneAndUpdate(
        { name: tag.name },
        tag,
        { upsert: true, new: true }
      );
      console.log(`✅ ${tag.name} (${tag.nameEn}) タグ作成完了`);
    }

    console.log('🎉 性格タグのシード完了');
    process.exit(0);
  } catch (error) {
    console.error('❌ シードエラー:', error);
    process.exit(1);
  }
}

seedPersonalityTags();