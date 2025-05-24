const jwt = require('jsonwebtoken');
require('dotenv').config();

const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  log('=== Admin Auth Middleware ===');
  log('Request path:', req.path);
  
  const token = req.cookies.adminToken;
  
  log('Admin token from cookies:', token ? 'Found' : 'Not found');
  
  if (!token) {
    return res.status(401).json({ msg: '管理者トークンがありません、認証が拒否されました' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    log('Admin token verified successfully:', decoded.admin.id);
    req.admin = decoded.admin;
    next();
  } catch (err) {
    console.error('Admin token verification failed:', err.message);
    res.status(401).json({ msg: '管理者トークンが無効です' });
  }
};
