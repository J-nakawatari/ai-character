const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Character = require('../models/Character');
const OpenAI = require('openai');

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
    
    const aiResponse = await generateAIResponse(
      message, 
      user.name, 
      character,
      chat.messages // 会話履歴を渡す
    );
    
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
    console.error('Chat API Error:', err.message);
    
    if (err.message && (err.message.includes('API key') || err.message.includes('authentication'))) {
      return res.status(500).json({ error: 'AIサービスの設定エラーが発生しました。管理者にお問い合わせください。' });
    }
    
    res.status(500).json({ error: 'サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。' });
  }
});

async function generateAIResponse(message, userName, character, chatHistory = []) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return `申し訳ありません、AIサービスの設定が完了していないためチャットができません。管理者にお問い合わせください。`;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const user = await User.findById(chatHistory[0]?.userId);
    const lang = user?.preferredLanguage || 'ja';

    const characterName = character.name[lang] || character.name.ja || character.name;
    const characterDescription = character.description[lang] || character.description.ja || character.description;
    const characterPrompt = character.adminPrompt[lang] || character.adminPrompt.ja || character.adminPrompt;

    let systemMessage = `あなたは${characterName}というAIキャラクターです。`;
    
    if (characterPrompt && characterPrompt.trim() !== '') {
      systemMessage += ` ${characterPrompt}`;
    }
    
    if (characterDescription && characterDescription.trim() !== '') {
      systemMessage += ` ${characterDescription}`;
    }
    
    if (lang === 'en') {
      systemMessage = `You are an AI character named ${characterName}. ${characterPrompt} ${characterDescription} The user's name is ${userName}. Please respond politely and keep your answers short.`;
    } else {
      systemMessage += ` ユーザーの名前は${userName}さんです。敬語を使って短く返答してください。`;
    }

    const messages = [
      { role: 'system', content: systemMessage }
    ];
    
    const recentMessages = chatHistory.slice(-5);
    for (const msg of recentMessages) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
    
    messages.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150, // 応答の長さを制限
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return `申し訳ありません、応答の生成中にエラーが発生しました。しばらく経ってからもう一度お試しください。`;
  }
}

module.exports = router;
