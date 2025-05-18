const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Character = require('./models/Character');

dotenv.config();

const updateCharacters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB接続成功');

    const characters = await Character.find({});
    console.log(`${characters.length}件のキャラクターを更新します`);

    for (const character of characters) {
      if (character.personalityPrompt && !character.personality) {
        character.personality = character.personalityPrompt;
        await character.save();
        console.log(`キャラクター「${character.name}」のpersonalityを更新しました`);
      }
    }

    console.log('すべてのキャラクターを更新しました');
    process.exit(0);
  } catch (err) {
    console.error('エラーが発生しました:', err);
    process.exit(1);
  }
};

updateCharacters();
