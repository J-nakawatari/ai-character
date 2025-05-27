const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function downgradeExpiredUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const now = new Date();
    const expiredUsers = await User.find({
      membershipType: 'subscription',
      subscriptionStatus: 'active',
      subscriptionEndDate: { $lt: now }
    });

    console.log(`Found ${expiredUsers.length} expired users`);

    for (const user of expiredUsers) {
      user.membershipType = 'free';
      user.subscriptionStatus = 'expired';
      await user.save();
      console.log(`✅ Downgraded user ${user.email} to free plan`);
    }

    console.log('Downgrade process completed');
  } catch (error) {
    console.error('❌ Error during downgrade process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// 毎日午前0時に実行
const schedule = require('node-schedule');
schedule.scheduleJob('0 0 * * *', downgradeExpiredUsers);

console.log('Scheduled daily downgrade check at midnight'); 