const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Character = require('../models/Character');

const uri = process.env.MONGO_URI; // ← .envから正しく読み込む

const typeMapping = {
  'free': 'free',
  'premium': 'subscription',
  'paid': 'purchaseOnly',
  'limited': 'purchaseOnly'
};

async function migrate() {
  try {
    await mongoose.connect(uri, { // ✅ 修正ポイント！
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    const characters = await Character.find({});
    console.log(`Found ${characters.length} characters to migrate`);

    for (const character of characters) {
      const oldType = character.characterType;
      const newType = typeMapping[oldType];

      if (!newType) {
        console.warn(`Unknown character type: ${oldType} for character ${character._id}`);
        continue;
      }

      const update = {
        characterAccessType: newType,         // ← 今後はこのフィールドが有効
        purchaseType: 'buy'
      };

      if ((newType === 'subscription' || newType === 'purchaseOnly') && character.price === 0) {
        update.price = 1000;
      }

      await Character.findByIdAndUpdate(character._id, update);
      console.log(`Migrated character ${character._id}: ${oldType} -> ${newType}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

migrate().catch(console.error);
