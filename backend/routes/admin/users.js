const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/User');

router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('selectedCharacter')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('selectedCharacter');
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

router.put('/:id/ban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({ msg: 'ユーザーが無効化されました' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    await user.remove();
    
    res.json({ msg: 'ユーザーが削除されました' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ユーザーが見つかりません' });
    }
    
    res.status(500).send('サーバーエラー');
  }
});

module.exports = router;
