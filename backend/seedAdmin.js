// backend/seedAdmin.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@example.com'; // ここを好きな管理者メールに
  const password = 'mbzabm6w';   // ここを好きなパスワードに

  // 既存の同じメールアドレスの管理者を削除（上書き用）
  await Admin.deleteMany({ email });

  // 新しい管理者を作成
  const admin = new Admin({ email, password });
  await admin.save();

  console.log('管理者アカウントを作成しました:', email);
  process.exit();
}

main();


