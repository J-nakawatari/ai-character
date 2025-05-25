require('dotenv').config();
const mongoose = require('mongoose');
const Character = require('./models/Character'); // ← パスを環境に応じて調整してください

const uri = 'mongodb+srv://designroommaster:mbzabm6w@cluster0.pnevemt.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

const mapCharacterTypeToAccessType = (type) => {
  switch (type) {
    case 'free':
      return 'free';
    case 'premium':
      return 'subscription';
    case 'paid':
      return 'purchaseOnly';
    case 'limited':
      return 'subscription'; // 限定キャラはサブスク扱いにしてavailableUntilで期間限定を制御
    default:
      return 'free';
  }
};

const migrate = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const characters = await Character.find();

    for (const char of characters) {
      const newAccessType = mapCharacterTypeToAccessType(char.characterType);
      const update = {
        characterAccessType: newAccessType,
        requiresAddOn: false,
        purchaseId: null,
        availableUntil: null,
        $unset: {
          characterType: "",
          purchaseType: ""
        }
      };

      await Character.updateOne({ _id: char._id }, { $set: update });
      console.log(`Migrated: ${char.name.ja}`);
    }

    console.log('Migration complete');
    process.exit();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
