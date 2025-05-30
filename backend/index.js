require('dotenv').config();
console.log('🚀 STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 10));

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

// 🔵 Webhookルートだけ特別に raw を使う（express.json より前！）
app.use('/api/webhook', require('./routes/webhook')); // ※routes/webhook.js が必要

// 🔍 リクエストログ（全ルート確認用）
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  next();
});

// 通常ミドルウェア
app.disable('etag');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(cookieParser());

// DB接続
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// 通常のルート
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/personality-tags', require('./routes/personalityTags'));

app.use('/api/admin/auth', require('./routes/admin/auth'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/characters', require('./routes/admin/characters'));

// 静的ファイル
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));

// ヘルスチェック
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
