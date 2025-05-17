const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

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

module.exports = router;
