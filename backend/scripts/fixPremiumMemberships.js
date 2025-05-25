const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const uri = process.env.MONGO_URI;

async function fixPremiumUsers() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const result = await User.updateMany(
      { membershipType: 'premium' },
      { $set: { membershipType: 'subscription' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users from 'premium' to 'subscription'`);
  } catch (error) {
    console.error('❌ Failed to update users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

fixPremiumUsers().catch(console.error);
