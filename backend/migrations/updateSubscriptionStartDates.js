const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('MONGO_URI:', process.env.MONGO_URI); // デバッグ用

const updateSubscriptionStartDates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('MongoDB接続成功');
    
    const users = await User.find({
      subscriptionStatus: 'active',
      subscriptionStartDate: { $exists: false }
    });
    
    console.log(`${users.length} ユーザーの更新が必要です`);
    
    for (const user of users) {
      user.subscriptionStartDate = user.createdAt;
      await user.save();
      console.log(`ユーザー ${user.name} のサブスクリプション開始日を更新しました`);
    }
    
    console.log('すべてのユーザーのサブスクリプション開始日を更新しました');
    process.exit(0);
  } catch (err) {
    console.error('エラー:', err);
    process.exit(1);
  }
};

updateSubscriptionStartDates(); 