const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const Character = require('../../models/Character');
const { uploadImage, uploadVoice, resizeImage } = require('../../utils/fileUpload');
const User = require('../../models/User');

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

// 新規作成
router.post('/', adminAuth, uploadImage.single('image'), resizeImage(), async (req, res) => {
  try {
    const {
      name,
      description,
      personality,
      personalityPrompt,
      adminPrompt,
      characterAccessType,
      // 新しいトークン制フィールド
      isBaseCharacter,
      requiresUnlock,
      model,
      gender,
      personalityPreset,
      personalityTags,
      price,
      purchaseType,
      voice,
      defaultMessage,
      limitMessage,
      themeColor,
      isActive,
      imageCharacterSelect,
      imageDashboard,
      imageChatBackground,
      imageChatAvatar,
      sampleVoiceUrl,
      galleryImage1,
      galleryImage2,
      galleryImage3,
      galleryImage4,
      galleryImage5,
      galleryImage6,
      galleryImage7,
      galleryImage8,
      galleryImage9,
      galleryImage10
    } = req.body;

    // 必須フィールドのバリデーション
    if (!name || !description) {
      return res.status(400).json({ msg: '名前と説明は必須です' });
    }

    try {
      const parsedName = JSON.parse(name);
      const parsedDescription = JSON.parse(description);
      const parsedPersonalityPrompt = JSON.parse(personalityPrompt || '{}');
      const parsedAdminPrompt = JSON.parse(adminPrompt || '{}');
      const parsedDefaultMessage = JSON.parse(defaultMessage || '{}');
      const parsedLimitMessage = JSON.parse(limitMessage || '{}');
      const parsedPersonalityTags = JSON.parse(personalityTags || '[]');

      const character = new Character({
        name: parsedName,
        description: parsedDescription,
        personality: personality || '',
        personalityPrompt: parsedPersonalityPrompt,
        adminPrompt: parsedAdminPrompt,
        characterAccessType,
        // 新しいトークン制フィールド
        isBaseCharacter: typeof isBaseCharacter === 'boolean' ? isBaseCharacter : isBaseCharacter === 'true',
        requiresUnlock: typeof requiresUnlock === 'boolean' ? requiresUnlock : requiresUnlock === 'true',
        model: model || 'gpt-3.5-turbo',
        gender: gender || 'neutral',
        personalityPreset: personalityPreset || 'おっとり系',
        personalityTags: parsedPersonalityTags,
        price: parseInt(price) || 0,
        purchaseType,
        voice,
        defaultMessage: parsedDefaultMessage,
        limitMessage: parsedLimitMessage,
        themeColor,
        isActive: typeof isActive === 'boolean' ? isActive : isActive === 'true',
        imageCharacterSelect: imageCharacterSelect || '',
        imageDashboard: imageDashboard || '',
        imageChatBackground: imageChatBackground || '',
        imageChatAvatar: imageChatAvatar || '',
        sampleVoiceUrl: sampleVoiceUrl || '',
        galleryImage1: galleryImage1 || '',
        galleryImage2: galleryImage2 || '',
        galleryImage3: galleryImage3 || '',
        galleryImage4: galleryImage4 || '',
        galleryImage5: galleryImage5 || '',
        galleryImage6: galleryImage6 || '',
        galleryImage7: galleryImage7 || '',
        galleryImage8: galleryImage8 || '',
        galleryImage9: galleryImage9 || '',
        galleryImage10: galleryImage10 || '',
        isPremium: characterAccessType === 'premium',
        isLimited: characterAccessType === 'limited'
      });

      // 画像アップロードがある場合、保存先を更新
      if (req.file) {
        character.imageCharacterSelect = `/uploads/images/${req.file.filename}`;
      }

      await character.save();
      res.json(character);
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError);
      return res.status(400).json({ msg: 'データの形式が正しくありません' });
    }
  } catch (err) {
    console.error('キャラクター作成エラー:', err);
    res.status(500).json({ msg: 'キャラクターの作成に失敗しました' });
  }
});

// 更新
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
      characterAccessType,
      // 新しいトークン制フィールド
      isBaseCharacter,
      requiresUnlock,
      model,
      gender,
      personalityPreset,
      personalityTags,
      price,
      purchaseType,
      voice,
      defaultMessage,
      limitMessage,
      themeColor,
      isActive
    } = req.body;

    // 多言語フィールドはJSON.parseで対応（フロント側でJSON.stringifyして送る）
    if (name !== undefined) {
      try {
        character.name = JSON.parse(name);
      } catch (error) {
        console.error('Failed to parse name:', error);
        character.name = { ja: '', en: '' };
      }
    }
    if (description !== undefined) {
      try {
        character.description = JSON.parse(description);
      } catch (error) {
        console.error('Failed to parse description:', error);
        character.description = { ja: '', en: '' };
      }
    }
    if (personalityPrompt !== undefined) {
      try {
        character.personalityPrompt = JSON.parse(personalityPrompt);
      } catch (error) {
        console.error('Failed to parse personalityPrompt:', error);
        character.personalityPrompt = { ja: '', en: '' };
      }
    }
    if (adminPrompt !== undefined) {
      try {
        character.adminPrompt = JSON.parse(adminPrompt);
      } catch (error) {
        console.error('Failed to parse adminPrompt:', error);
        character.adminPrompt = { ja: '', en: '' };
      }
    }
    if (characterAccessType) {
      character.characterAccessType = characterAccessType;
      character.isPremium = characterAccessType === 'premium';
      character.isLimited = characterAccessType === 'limited';
    }
    
    // 新しいトークン制フィールドの更新
    if (typeof isBaseCharacter !== 'undefined') {
      character.isBaseCharacter = typeof isBaseCharacter === 'boolean' ? isBaseCharacter : isBaseCharacter === 'true';
    }
    if (typeof requiresUnlock !== 'undefined') {
      character.requiresUnlock = typeof requiresUnlock === 'boolean' ? requiresUnlock : requiresUnlock === 'true';
    }
    if (model) character.model = model;
    if (gender) character.gender = gender;
    if (personalityPreset) character.personalityPreset = personalityPreset;
    if (personalityTags !== undefined) {
      try {
        character.personalityTags = JSON.parse(personalityTags);
      } catch (error) {
        console.error('Failed to parse personalityTags:', error);
        character.personalityTags = [];
      }
    }
    
    if (price) character.price = parseInt(price);
    if (purchaseType) character.purchaseType = purchaseType;
    if (voice) character.voice = voice;
    if (defaultMessage !== undefined) {
      try {
        character.defaultMessage = JSON.parse(defaultMessage);
      } catch (error) {
        console.error('Failed to parse defaultMessage:', error);
        character.defaultMessage = { ja: '', en: '' };
      }
    }
    if (limitMessage !== undefined) {
      try {
        const parsedLimitMessage = JSON.parse(limitMessage);
        character.limitMessage = parsedLimitMessage;
      } catch (error) {
        console.error('Failed to parse limitMessage:', error);
        // パースに失敗した場合は空のオブジェクトを設定
        character.limitMessage = { ja: '', en: '' };
      }
    }
    if (themeColor) character.themeColor = themeColor;
    if (typeof isActive !== 'undefined') {
      character.isActive = typeof isActive === 'boolean' ? isActive : isActive === 'true';
    }

    // 画像アップロードがある場合、保存先を更新
    if (req.file) {
      character.imageCharacterSelect = `/uploads/images/${req.file.filename}`;
    }

    if (req.body.imageCharacterSelect) character.imageCharacterSelect = req.body.imageCharacterSelect;
    if (req.body.imageDashboard) character.imageDashboard = req.body.imageDashboard;
    if (req.body.imageChatBackground) character.imageChatBackground = req.body.imageChatBackground;
    if (req.body.imageChatAvatar) character.imageChatAvatar = req.body.imageChatAvatar;
    if (req.body.sampleVoiceUrl) character.sampleVoiceUrl = req.body.sampleVoiceUrl;
    
    // ギャラリー画像の更新
    for (let i = 1; i <= 10; i++) {
      const galleryField = `galleryImage${i}`;
      if (req.body[galleryField]) {
        character[galleryField] = req.body[galleryField];
      }
    }

    await character.save();
    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// 削除
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }

    // キャラクターを選択しているユーザーがいないか確認
    const usersWithCharacter = await User.find({ selectedCharacter: req.params.id });
    if (usersWithCharacter.length > 0) {
      return res.status(400).json({ 
        msg: 'このキャラクターを選択しているユーザーが存在するため、削除できません。先にユーザーの選択を解除してください。' 
      });
    }

    // 購入済みのユーザーがいないか確認
    const usersWithPurchase = await User.find({
      'purchasedCharacters.character': req.params.id
    });
    if (usersWithPurchase.length > 0) {
      return res.status(400).json({ 
        msg: 'このキャラクターを購入しているユーザーが存在するため、削除できません。' 
      });
    }

    await character.deleteOne();
    res.json({ msg: 'キャラクターを削除しました' });
  } catch (err) {
    console.error('キャラクター削除エラー:', err);
    res.status(500).json({ msg: 'キャラクターの削除に失敗しました' });
  }
});

// 画像アップロード
router.post('/upload/image', adminAuth, uploadImage.single('image'), resizeImage(), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: '画像がありません' });
  }
  res.json({ imageUrl: `/uploads/images/${req.file.filename}` });
});

// 音声アップロード
router.post('/upload/voice', adminAuth, uploadVoice.single('sampleVoice'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: '音声ファイルがありません' });
  }
  res.json({ voiceUrl: `/uploads/voice/${req.file.filename}` });
});

module.exports = router;
