const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Character = require('../models/Character');

router.get('/', auth, async (req, res) => {
  try {
    const { characterId } = req.query;
    
    if (!characterId) {
      return res.status(400).json({ msg: 'Character ID is required' });
    }
    
    let chat = await Chat.findOne({ 
      userId: req.user.id,
      characterId
    });
    
    if (!chat) {
      chat = new Chat({
        userId: req.user.id,
        characterId,
        messages: []
      });
      await chat.save();
    }
    
    res.json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { characterId, message } = req.body;
    
    if (!characterId || !message) {
      return res.status(400).json({ msg: 'Character ID and message are required' });
    }
    
    const user = await User.findById(req.user.id);
    const character = await Character.findById(characterId);
    
    if (!user || !character) {
      return res.status(404).json({ msg: 'User or character not found' });
    }
    
    let chat = await Chat.findOne({ userId: req.user.id, characterId });
    
    if (!chat) {
      chat = new Chat({
        userId: req.user.id,
        characterId,
        messages: []
      });
    }
    
    chat.messages.push({
      sender: 'user',
      content: message
    });
    
    const aiResponse = generateAIResponse(message, user.name, character);
    
    chat.messages.push({
      sender: 'ai',
      content: aiResponse
    });
    
    await chat.save();
    
    res.json({
      reply: aiResponse,
      chatId: chat._id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

function generateAIResponse(message, userName, character) {
  const greetings = ['こんにちは', 'やあ', 'どうも'];
  const questions = [
    'どうしましたか？',
    '何かお手伝いできることはありますか？',
    '今日はどんな一日でしたか？'
  ];
  
  if (message.toLowerCase().includes('こんにちは') || 
      message.toLowerCase().includes('はじめまして')) {
    return `${userName}さん、はじめまして！${character.name}です。${character.description} どうぞよろしくお願いします！`;
  }
  
  let response;
  
  const personality = character.personality || character.personalityPrompt || '';
  
  switch (personality.toLowerCase()) {
    case '優しい':
    case 'やさしい':
    case '親切':
      response = `${userName}さん、${character.name}です。${message}ですね。私にできることがあれば、なんでも言ってくださいね。`;
      break;
    case '論理的':
    case '冷静':
      response = `分析しました。${message}については、まず状況を整理しましょう。何か具体的な情報があれば教えてください。`;
      break;
    case '元気':
    case '明るい':
      response = `やったー！${userName}さん！${message}なんて素敵ですね！一緒に楽しみましょう！`;
      break;
    default:
      response = `${userName}さん、${greetings[Math.floor(Math.random() * greetings.length)]}。${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  return response;
}

module.exports = router;
