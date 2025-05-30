const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Character = require('../models/Character');
const bcrypt = require('bcryptjs');
const { getAffinityLevelDescription, updateAffinity } = require('../utils/affinity');

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
    
    if (!character) {
      return res.status(404).json({ msg: 'キャラクターが見つかりません' });
    }

    // キャラクターの種類に応じたチェック
    if (character.characterAccessType === 'subscription') {
      if (user.membershipType !== 'subscription' || user.subscriptionStatus !== 'active') {
        return res.status(403).json({ msg: 'このキャラクターは有料会員限定です' });
      }
    } else if (character.characterAccessType === 'purchaseOnly') {
      if (!Array.isArray(user.purchasedCharacters)) {
        return res.status(403).json({ msg: 'このキャラクターは購入が必要です' });
      }

      const isPurchased = user.purchasedCharacters.some(
        pc => pc.character.toString() === characterId && pc.purchaseType === 'buy'
      );
      
      if (!isPurchased) {
        return res.status(403).json({ msg: 'このキャラクターは購入が必要です' });
      }
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

// 親密度情報を取得
router.get('/me/affinity/:characterId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { characterId } = req.params;
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    
    const affinity = user.affinities.find(
      a => a.character.toString() === characterId.toString()
    );
    
    if (!affinity) {
      return res.json({ 
        level: 0, 
        streak: 0,
        description: getAffinityLevelDescription(0)
      });
    }
    
    res.json({
      level: affinity.level,
      streak: affinity.lastVisitStreak,
      lastInteracted: affinity.lastInteractedAt,
      description: getAffinityLevelDescription(affinity.level)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// サブスク（プレミアム）アップグレードAPI
router.post('/me/subscribe', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    // すでにプレミアム会員の場合は何もしない
    if (user.membershipType === 'subscription' && user.subscriptionStatus === 'active') {
      return res.status(400).json({ msg: 'すでにサブスク会員です' });
    }
    user.membershipType = 'subscription';
    user.subscriptionStatus = 'active';
    user.subscriptionStartDate = new Date();
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日後
    await user.save();
    res.json({ msg: 'プレミアム会員にアップグレードしました', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// サブスク解除APIを追加
router.post('/me/unsubscribe', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    // すでに無料会員なら何もしない
    if (user.membershipType === 'free') {
      return res.status(400).json({ msg: 'すでに無料会員です' });
    }
    user.membershipType = 'free';
    user.subscriptionStatus = 'canceled';
    user.subscriptionEndDate = new Date(); // ここは必要に応じて調整
    await user.save();
    res.json({ msg: 'サブスクを解除しました', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

module.exports = router;
