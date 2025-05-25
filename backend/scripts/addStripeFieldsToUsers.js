const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const result = await User.updateMany({}, {
    $set: {
      stripeCustomerId: null,
      stripeSubscriptionId: null
    }
  });

  console.log(`Updated ${result.modifiedCount} users.`);
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

main().catch(e => { console.error(e); process.exit(1); }); 