const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Character = require('../models/Character');
const uri = process.env.MONGO_URI;

async function forceRemoveCharacterTypeField() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const result = await Character.updateMany(
      {}, // ✅ 全件対象で強制削除
      { $unset: { characterType: "" } }
    );

    console.log(`✅ Removed 'characterType' from ${result.modifiedCount} characters.`);
  } catch (error) {
    console.error('❌ Field removal failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

forceRemoveCharacterTypeField().catch(console.error);
