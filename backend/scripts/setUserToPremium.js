const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const userId = '682fedb08315942972dff7ca';

const setUserToPremium = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findById(userId);
    if (!user) {
      console.log('ユーザーが見つかりません');
      process.exit(1);
    }

    user.membershipType = 'premium';
    user.subscriptionStatus = 'active';
    user.subscriptionStartDate = new Date();
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日後

    await user.save();
    console.log(`ユーザー ${user.name}（ID: ${userId}）をサブスク会員に変更しました`);
    process.exit(0);
  } catch (err) {
    console.error('エラー:', err);
    process.exit(1);
  }
};

setUserToPremium(); 