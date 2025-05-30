const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');

router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.find({ isPublic: true }).select('key value type');
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });
    res.json(settingsMap);
  } catch (error) {
    console.error('設定取得エラー:', error);
    res.status(500).json({ error: '設定の取得に失敗しました' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ 
      key: req.params.key,
      isPublic: true 
    }).select('key value type');
    
    if (!setting) {
      return res.status(404).json({ error: '設定が見つかりません' });
    }
    
    res.json({ [setting.key]: setting.value });
  } catch (error) {
    console.error('設定取得エラー:', error);
    res.status(500).json({ error: '設定の取得に失敗しました' });
  }
});

module.exports = router;