const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const Character = require('../../models/Character');
const { uploadImage, uploadVoice } = require('../../utils/fileUpload');

router.get('/', adminAuth, async (req, res) => {
  try {
    const characters = await Character.find().sort({ createdAt: -1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
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
    
    const newCharacter = new Character({
      name,
      description,
      personalityPrompt,
      adminPrompt,
      characterType,
      isPremium: characterType === 'premium',
      isLimited: characterType === 'limited',
      price: parseInt(price) || 0,
      purchaseType,
      voice,
      defaultMessage,
      themeColor,
      isActive: typeof isActive === 'boolean' ? isActive : isActive === 'true',
      imageCharacterSelect: req.body.imageCharacterSelect || '',
      imageDashboard: req.body.imageDashboard || '',
      imageChatBackground: req.body.imageChatBackground || '',
      imageChatAvatar: req.body.imageChatAvatar || '',
      sampleVoiceUrl: req.body.sampleVoiceUrl || ''
    });
    
    const character = await newCharacter.save();
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
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
      isActive,
      imageCharacterSelect,
      imageDashboard,
      imageChatBackground,
      imageChatAvatar,
      sampleVoiceUrl
    } = req.body;
    
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    character.name = name || character.name;
    character.description = description || character.description;
    character.personalityPrompt = personalityPrompt || character.personalityPrompt;
    character.adminPrompt = adminPrompt || character.adminPrompt;
    character.characterType = characterType || character.characterType;
    character.isPremium = characterType === 'premium';
    character.isLimited = characterType === 'limited';
    character.price = parseInt(price) || character.price;
    character.purchaseType = purchaseType || character.purchaseType;
    character.voice = voice || character.voice;
    character.defaultMessage = defaultMessage || character.defaultMessage;
    character.themeColor = themeColor || character.themeColor;
    character.isActive = typeof isActive === 'boolean' ? isActive : isActive === 'true';
    
    if (imageCharacterSelect) character.imageCharacterSelect = imageCharacterSelect;
    if (imageDashboard) character.imageDashboard = imageDashboard;
    if (imageChatBackground) character.imageChatBackground = imageChatBackground;
    if (imageChatAvatar) character.imageChatAvatar = imageChatAvatar;
    if (sampleVoiceUrl) character.sampleVoiceUrl = sampleVoiceUrl;
    
    await character.save();
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    await Character.deleteOne({ _id: req.params.id });
    
    res.json({ msg: 'キャラクターが削除されました' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

router.post('/upload/image', adminAuth, uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'アップロードするファイルが選択されていません' });
    }
    
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.post('/upload/voice', adminAuth, uploadVoice.single('sampleVoice'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'アップロードするファイルが選択されていません' });
    }
    
    const voiceUrl = `/uploads/voice/${req.file.filename}`;
    res.json({ voiceUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.put('/:id/image', adminAuth, async (req, res) => {
  try {
    const { imageType, imageUrl } = req.body;
    
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    switch(imageType) {
      case 'characterSelect':
        character.imageCharacterSelect = imageUrl;
        break;
      case 'dashboard':
        character.imageDashboard = imageUrl;
        break;
      case 'chatBackground':
        character.imageChatBackground = imageUrl;
        break;
      case 'chatAvatar':
        character.imageChatAvatar = imageUrl;
        break;
      default:
        return res.status(400).json({ msg: '無効な画像タイプです' });
    }
    
    await character.save();
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

router.put('/:id/voice', adminAuth, async (req, res) => {
  try {
    const { voiceUrl } = req.body;
    
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    character.sampleVoiceUrl = voiceUrl;
    await character.save();
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

module.exports = router;
