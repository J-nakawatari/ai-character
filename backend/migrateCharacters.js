const mongoose = require('mongoose');
const Character = require('./models/Character');
require('dotenv').config();

async function migrateCharacters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    const characters = await Character.find();
    console.log(`Found ${characters.length} characters to migrate`);

    for (const character of characters) {
      const oldName = character.name;
      const oldDescription = character.description;
      const oldPersonalityPrompt = character.personalityPrompt;
      const oldAdminPrompt = character.adminPrompt;
      const oldDefaultMessage = character.defaultMessage;

      character.name = { ja: oldName, en: oldName };
      character.description = { ja: oldDescription, en: '' };
      character.personalityPrompt = { ja: oldPersonalityPrompt, en: '' };
      character.adminPrompt = { ja: oldAdminPrompt, en: '' };
      character.defaultMessage = { ja: oldDefaultMessage, en: '' };

      await character.save();
      console.log(`Migrated character: ${oldName}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateCharacters();
