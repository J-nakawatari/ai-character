const express = require('express');
const router = express.Router();
const PersonalityTag = require('../models/PersonalityTag');

router.get('/', async (req, res) => {
  try {
    const { locale = 'ja' } = req.query;
    const tags = await PersonalityTag.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    const localizedTags = tags.map(tag => ({
      _id: tag._id,
      name: locale === 'en' ? tag.nameEn : tag.name,
      color: tag.color,
      order: tag.order
    }));
    
    res.json(localizedTags);
  } catch (error) {
    console.error('性格タグ取得エラー:', error);
    res.status(500).json({ error: '性格タグの取得に失敗しました' });
  }
});

module.exports = router;