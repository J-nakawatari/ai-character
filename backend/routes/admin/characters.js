const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const Character = require('../../models/Character');
const { uploadImage, resizeImage } = require('../../utils/fileUpload');

// 一覧取得
router.get('/', adminAuth, async (req, res) => {
  try {
    const characters = await Character.find().sort({ createdAt: -1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// 詳細取得
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.put('/:id', adminAuth, uploadImage.single('image'), resizeImage(), async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }

    const {
      name,
      description,
      personalityPrompt,
      adminPrompt,
      characterType,
      price,
      purchaseType,
      voice,
      defaultMessage,
      themeColor,
      isActive
    } = req.body;

    // 多言語フィールドはJSON.parseで対応（フロント側でJSON.stringifyして送る）
    if (name) character.name = JSON.parse(name);
    if (description) character.description = JSON.parse(description);
    if (personalityPrompt) character.personalityPrompt = personalityPrompt;
    if (adminPrompt) character.adminPrompt = adminPrompt;
    if (characterType) {
      character.characterType = characterType;
      character.isPremium = characterType === 'premium';
      character.isLimited = characterType === 'limited';
    }
    if (price) character.price = parseInt(price);
    if (purchaseType) character.purchaseType = purchaseType;
    if (voice) character.voice = voice;
    if (defaultMessage) character.defaultMessage = defaultMessage;
    if (themeColor) character.themeColor = themeColor;
    if (typeof isActive !== 'undefined') {
      character.isActive = typeof isActive === 'boolean' ? isActive : isActive === 'true';
    }

    // 画像アップロードがある場合、保存先を更新
    if (req.file) {
      character.imageCharacterSelect = `/uploads/images/${req.file.filename}`;
    }

    await character.save();
    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});
module.exports = router;
