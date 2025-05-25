require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const uri = process.env.MONGO_URI;

const migrate = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const users = await User.find();

    for (const user of users) {
      let membershipType = user.membershipType;

      // "premium" を "subscription" に変換
      if (membershipType === 'premium') {
        membershipType = 'subscription';
      }

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            membershipType,
            addOnSubscriptions: []
          },
          $unset: {
            subscriptionStatus: ""
          }
        }
      );

      console.log(`Migrated user: ${user.email}`);
    }

    console.log('User migration complete');
    process.exit();
  } catch (error) {
    console.error('User migration failed:', error);
    process.exit(1);
  }
};

migrate();