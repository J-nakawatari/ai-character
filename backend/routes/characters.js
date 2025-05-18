const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Character = require('../models/Character');

router.get('/', auth, async (req, res) => {
  try {
    const characters = await Character.find({ isActive: true });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

module.exports = router;
