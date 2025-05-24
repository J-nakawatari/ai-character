const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const adminAuth = require('../../middleware/adminAuth');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(400).json({ msg: 'メールアドレスまたはパスワードが無効です' });
    }
    
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'メールアドレスまたはパスワードが無効です' });
    }
    
    const payload = {
      admin: {
        id: admin.id
      }
    };
    
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        
        res.cookie('adminToken', token, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 1日
          secure: process.env.NODE_ENV === 'production'
        });
        
        res.json({ success: true });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.get('/user', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

router.post('/logout', adminAuth, (req, res) => {
  res.clearCookie('adminToken');
  res.json({ msg: 'ログアウトしました' });
});

module.exports = router;
