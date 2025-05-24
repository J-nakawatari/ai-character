const jwt = require('jsonwebtoken');
const jwtBlacklist = require('../utils/jwtBlacklist');
require('dotenv').config();

const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  log('=== Auth Middleware ===');
  log('Request path:', req.path);
  log('Request headers:', JSON.stringify(req.headers, null, 2));
  log('All cookies:', JSON.stringify(req.cookies, null, 2));

  // ✅ Cookie or Authorization ヘッダー両対応
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') &&
      req.headers.authorization.split(' ')[1]);

  log('Token resolved:', token ? token.substring(0, 20) + '...' : 'Not found');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  if (jwtBlacklist.has(token)) {
    return res.status(401).json({ msg: 'Token is blacklisted' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    log('✅ Token verified successfully:', decoded.user.id);
    req.user = decoded.user;

    const User = require('../models/User');
    User.findById(decoded.user.id)
      .then(user => {
        log('🔍 取得されたユーザー情報:', user);

        if (!user || user.isActive === false) {
          log('⚠️ アカウントが無効または存在しない');
          return res.status(403).json({ msg: 'アカウントが無効化されています。' });
        }

        log('✅ ユーザー認証成功:', user.email);
        req.user = user; // フルユーザー情報を格納
        next();
      })
      .catch(err => {
        console.error('❌ ユーザー情報取得エラー:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
      });
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
