// run this manually via node scripts/updateLimitMessages.js
const mongoose = require('mongoose');
const Character = require('../models/Character');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const characters = await Character.find();

  for (const char of characters) {
    if (!char.limitMessage || char.limitMessage.size === 0) {
      char.limitMessage = new Map([
        ['ja', '今日はもうお話しできないよ。また明日ね。'],
        ['en', "Looks like we can't chat anymore today. Let's talk tomorrow!"]
      ]);
      await char.save();
      console.log(`✅ Updated ${char.name?.ja || char.name}: limitMessage added.`);
    }
  }

  console.log('🎉 Done.');
  mongoose.disconnect();
});
