// run this manually via node scripts/updateLimitMessages.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();

// MongoDBの接続設定
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Characterスキーマの定義
const characterSchema = new Schema({
  name: {
    type: Map,
    of: String,
    required: true
  },
  description: {
    type: Map,
    of: String,
    required: true
  },
  personality: String,
  voiceUrl: String,
  sampleVoiceUrl: String,
  limitMessage: {
    type: Map,
    of: String,
    default: {}
  }
});

// Characterモデルの作成
const Character = mongoose.model('Character', characterSchema);

// 既存のキャラクターにlimitMessageを追加する関数
const updateCharacters = async (forceUpdate = false) => {
  try {
    await connectDB();
    const characters = await Character.find({});
    console.log(`Found ${characters.length} characters to update`);

    for (const character of characters) {
      // forceUpdateがtrueの場合、またはlimitMessageが存在しない場合は更新
      if (forceUpdate || !character.limitMessage || character.limitMessage.size === 0) {
        character.limitMessage = new Map([
          ['ja', '今日はもうお話しできないよ。また明日ね。'],
          ['en', 'Looks like we can\'t chat anymore today. Let\'s talk tomorrow!']
        ]);
        await character.save();
        console.log(`Updated character: ${character.name.get('ja') || character.name.get('en')}`);
      } else {
        console.log(`Character ${character.name.get('ja') || character.name.get('en')} already has limitMessage, skipping...`);
      }
    }

    console.log('Successfully updated all characters with limitMessage');
  } catch (error) {
    console.error('Error updating characters:', error);
  } finally {
    // データベース接続を閉じる
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// スクリプトを実行（forceUpdateをtrueに設定）
updateCharacters(true);
