const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');

async function fixFreeUserSubscriptionStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const result = await User.updateMany(
      { 
        membershipType: 'free',
        subscriptionStatus: 'active'
      },
      { 
        $set: { 
          subscriptionStatus: 'inactive',
          subscriptionStartDate: null,
          subscriptionEndDate: null
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} free users' subscription status to 'inactive'`);
  } catch (error) {
    console.error('❌ Failed to update users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

fixFreeUserSubscriptionStatus().catch(console.error); 