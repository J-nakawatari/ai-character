const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Character = require('../models/Character');
const uri = process.env.MONGO_URI;

async function finalCharacterTypeCleanup() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    // 明示的に characterType が存在するものだけ削除
    const result = await Character.updateMany(
      { characterType: { $exists: true } },
      { $unset: { characterType: "" } }
    );

    console.log(`✅ Removed 'characterType' from ${result.modifiedCount} characters.`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

finalCharacterTypeCleanup().catch(console.error);
