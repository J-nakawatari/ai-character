const mongoose = require('mongoose');
require('dotenv').config();
const Character = require('./models/Character');

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const characters = [
  {
    name: 'Miko',
    description: 'A friendly AI assistant with a calm and helpful personality.',
    imageUrl: '/characters/miko.png',
    personality: 'Calm, helpful, and friendly'
  },
  {
    name: 'Robo',
    description: 'A robot-like AI character with logical thinking and precise answers.',
    imageUrl: '/characters/robo.png',
    personality: 'Logical, precise, and technical'
  },
  {
    name: 'Luna',
    description: 'A cheerful AI companion with a bubbly personality and creative thinking.',
    imageUrl: '/characters/luna.png',
    personality: 'Cheerful, creative, and engaging'
  },
  {
    name: 'Zen',
    description: 'A wise AI mentor with philosophical insights and thoughtful advice.',
    imageUrl: '/characters/zen.png',
    personality: 'Wise, thoughtful, and philosophical'
  }
];

const seedCharacters = async () => {
  try {
    await Character.deleteMany({});
    
    await Character.insertMany(characters);
    
    console.log('✅ Characters seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding characters:', err);
    process.exit(1);
  }
};

seedCharacters();
