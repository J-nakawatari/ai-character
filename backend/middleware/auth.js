const jwt = require('jsonwebtoken');
const jwtBlacklist = require('../utils/jwtBlacklist');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  console.log('=== Auth Middleware ===');
  console.log('Request path:', req.path);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('All cookies:', JSON.stringify(req.cookies, null, 2));
  
  const token = req.cookies.token;
  
  console.log('Token from cookies:', token ? 'Found' : 'Not found');
  
  if (jwtBlacklist.has(token)) {
    return res.status(401).json({ msg: 'Token is blacklisted' });
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded.user.id);
    req.user = decoded.user;
    // isActiveチェック
    const User = require('../models/User');
    User.findById(decoded.user.id).then(user => {
      if (!user || user.isActive === false) {
        return res.status(403).json({ msg: 'アカウントが無効化されています。' });
      }
      next();
    }).catch(err => {
      console.error('User fetch failed:', err.message);
      res.status(401).json({ msg: 'Token is not valid' });
    });
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
