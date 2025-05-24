const mongoose = require('mongoose');
const User = require('../backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function downgradeExpiredUsers() {
  await mongoose.connect(process.env.MONGO_URI);

  const now = new Date();
  const expiredUsers = await User.find({
    membershipType: 'premium',
    subscriptionEndDate: { $lt: now }
  });

  for (const user of expiredUsers) {
    user.membershipType = 'free';
    user.subscriptionStatus = 'inactive';
    user.subscriptionStartDate = null;
    user.subscriptionEndDate = null;
    await user.save();
    console.log(`ユーザー ${user.email} を無料会員に戻しました`);
  }

  await mongoose.disconnect();
  console.log('完了');
  process.exit(0);
}

downgradeExpiredUsers(); 