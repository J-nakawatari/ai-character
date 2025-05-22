const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Character = require('../models/Character');
const bcrypt = require('bcryptjs');

router.put('/setup', auth, async (req, res) => {
  const { name, characterId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.name = name || user.name;
    user.selectedCharacter = characterId;
    user.hasCompletedSetup = true;
    
    await user.save();
    
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('selectedCharacter');
    
    res.json(populatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('selectedCharacter');
      
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('selectedCharacter')
      .populate({
        path: 'purchasedCharacters.character',
        select: 'name imageCharacterSelect price purchaseType isPremium'
      });
      
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    user.lastLoginDate = Date.now();
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.get('/me/purchases', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('purchasedCharacters')
      .populate({
        path: 'purchasedCharacters.character',
        select: 'name imageCharacterSelect price purchaseType isPremium'
      });
      
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    res.json(user.purchasedCharacters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.patch('/me/use-character', auth, async (req, res) => {
  const { characterId } = req.body;
  
  if (!characterId) {
    return res.status(400).json({ msg: 'キャラクターIDが必要です' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    const character = await Character.findById(characterId);
    const isPurchased = user.purchasedCharacters.some(pc => pc.character.toString() === characterId);
    
    if (!character || (!isPurchased && character.isPremium)) {
      return res.status(400).json({ msg: '購入されていないキャラクターです' });
    }
    
    user.selectedCharacter = characterId;
    await user.save();
    
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('selectedCharacter');
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.patch('/me/language', auth, async (req, res) => {
  const { language } = req.body;
  
  if (!language || !['ja', 'en'].includes(language)) {
    return res.status(400).json({ msg: '有効な言語を指定してください' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    user.preferredLanguage = language;
    await user.save();
    
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('selectedCharacter');
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.post('/me/delete', auth, async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ msg: '確認のためパスワードが必要です' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'パスワードが正しくありません' });
    }
    
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: 'アカウントが削除されました' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

module.exports = router;
