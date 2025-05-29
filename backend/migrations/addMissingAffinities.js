// migrations/addMissingAffinities.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // ← backend/.env を明示指定
const mongoose = require('mongoose');
const User = require('../models/User');

async function runMigration() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ .env に MONGO_URI が設定されていません');
      process.exit(1);
    }

    console.log('🚀 MongoDB に接続中...');
    await mongoose.connect(mongoUri);

    console.log('🔍 affinities フィールドが存在しないユーザーを検索中...');
    const users = await User.find({ affinities: { $exists: false } });

    console.log(`🧮 該当ユーザー数: ${users.length}`);

    if (users.length === 0) {
      console.log('✅ すべてのユーザーに affinities が存在しています。');
      await mongoose.disconnect();
      return;
    }

    const bulkOps = users.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { affinities: [] } }
      }
    }));

    const result = await User.bulkWrite(bulkOps);

    console.log(`✅ マイグレーション完了！${result.modifiedCount} ユーザーを更新しました。`);
    await mongoose.disconnect();
    console.log('🔌 MongoDB 切断完了。');
  } catch (err) {
    console.error('❌ マイグレーションエラー:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
