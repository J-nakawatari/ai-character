const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Character = require('../models/Character');
const OpenAI = require('openai');
const { updateAffinity, getToneStyle } = require('../utils/affinity');

router.get('/', auth, async (req, res) => {
  try {
    const { characterId } = req.query;
    
    if (!characterId) {
      return res.status(400).json({ msg: 'Character ID is required' });
    }

    // ユーザーとキャラクターの情報を取得
    const user = await User.findById(req.user.id);
    const character = await Character.findById(characterId);
    
    if (!user || !character) {
      return res.status(404).json({ msg: 'User or character not found' });
    }

    // 無料会員のチャット制限状態をチェック
    let isLimitReached = false;
    let remainingChats = null;
    
    if (user.membershipType === 'free') {
      const today = new Date();
      const lastResetDate = new Date(user.lastChatResetDate);
      
      // 日付が変わった場合はカウントをリセット
      if (today.toDateString() !== lastResetDate.toDateString()) {
        user.dailyChatCount = 0;
        user.lastChatResetDate = today;
        await user.save();
      }
      
      isLimitReached = user.dailyChatCount >= 5;
      remainingChats = Math.max(0, 5 - user.dailyChatCount);
    }

    // キャラクターの種類に応じたチェック
    if (character.characterAccessType === 'subscription') {
      if (user.membershipType !== 'subscription' || user.subscriptionStatus !== 'active') {
        return res.status(403).json({ msg: 'このキャラクターは有料会員限定です' });
      }
    } else if (character.characterAccessType === 'purchaseOnly') {
      const isPurchased = user.purchasedCharacters.some(
        pc => pc.character.toString() === characterId && pc.purchaseType === 'buy'
      );
      
      if (!isPurchased) {
        return res.status(403).json({ msg: 'このキャラクターは購入が必要です' });
      }
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
    
    // 制限に達した場合、制限メッセージをチャット履歴に追加
    if (isLimitReached && user.membershipType === 'free') {
      const locale = user.preferredLanguage || 'ja';
      // 管理画面で設定された制限メッセージを取得
      const adminLimitMessage = getString(character.limitMessage, locale);
      
      // DBに制限メッセージが設定されている場合のみ表示
      if (adminLimitMessage && adminLimitMessage.trim()) {
        const limitMessage = {
          sender: 'ai',
          content: adminLimitMessage,
          timestamp: new Date(),
          isLimitMessage: true
        };
        
        // 既に制限メッセージがある場合は追加しない
        const hasLimitMessage = chat.messages.some(msg => msg.isLimitMessage);
        if (!hasLimitMessage) {
          chat.messages.push(limitMessage);
          await chat.save();
        }
      }
    }
    
    res.json({
      ...chat.toObject(),
      isLimitReached,
      remainingChats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// 文字列化ユーティリティ
function getString(val, locale = 'ja') {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    return val[locale] || val.ja || val.en || '';
  }
  return '';
}

router.post('/', auth, async (req, res) => {
  try {
    const { characterId, message } = req.body;
    
    if (!characterId || !message) {
      return res.status(400).json({ msg: 'Character ID and message are required' });
    }

    // ユーザーとキャラクターの情報を取得
    const user = await User.findById(req.user.id);
    const character = await Character.findById(characterId);
    
    if (!user || !character) {
      return res.status(404).json({ msg: 'User or character not found' });
    }

    // 無料会員の1日チャット制限をチェック
    if (user.membershipType === 'free') {
      const today = new Date();
      const lastResetDate = new Date(user.lastChatResetDate);
      
      // 日付が変わった場合はカウントをリセット
      if (today.toDateString() !== lastResetDate.toDateString()) {
        user.dailyChatCount = 0;
        user.lastChatResetDate = today;
        await user.save();
      }
      
      // 1日5回の制限をチェック
      if (user.dailyChatCount >= 5) {
        return res.status(429).json({ 
          msg: '無料会員は1日5回までチャットできます。プレミアム会員になると制限が解除されます。',
          isLimitReached: true
        });
      }
    }

    // キャラクターの種類に応じたチェック
    if (character.characterAccessType === 'subscription') {
      if (user.membershipType !== 'subscription' || user.subscriptionStatus !== 'active') {
        return res.status(403).json({ msg: 'このキャラクターは有料会員限定です' });
      }
    } else if (character.characterAccessType === 'purchaseOnly') {
      const isPurchased = user.purchasedCharacters.some(
        pc => pc.character.toString() === characterId && pc.purchaseType === 'buy'
      );
      
      if (!isPurchased) {
        return res.status(403).json({ msg: 'このキャラクターは購入が必要です' });
      }
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
    }
    
    // メッセージを追加
    chat.messages.push({
      sender: 'user',
      content: message,
      timestamp: new Date()
    });
    
    await chat.save();
    
    // AIの応答を生成
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // 親密度を更新
    await updateAffinity(user, characterId, 'chat');
    await user.save();
    
    // 親密度を取得
    const affinity = user.affinities.find(
      a => a.character.toString() === characterId.toString()
    );
    const affinityLevel = affinity ? affinity.level : 0;
    const toneStyle = getToneStyle(affinityLevel);
    
    // localeの取得
    const locale = user.preferredLanguage || 'ja';
    // システムメッセージの文字列化
    const systemPrompt = getString(character.personalityPrompt, locale);
    
    // 親密度に応じたプロンプトを追加
    const enhancedPrompt = `${systemPrompt}\n\n現在の親密度レベル: ${affinityLevel}/100\n話し方: ${toneStyle}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: enhancedPrompt
        },
        ...chat.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content : getString(msg.content, locale)
        }))
      ]
    });
    
    const aiReply = completion.choices[0].message.content;
    
    // AIの応答を保存
    chat.messages.push({
      sender: 'ai',
      content: aiReply,
      timestamp: new Date()
    });
    
    await chat.save();
    
    // 無料会員のチャット回数をカウントアップ
    if (user.membershipType === 'free') {
      user.dailyChatCount += 1;
      await user.save();
    }
    
    res.json({ 
      reply: aiReply,
      affinity: {
        level: affinityLevel,
        streak: affinity ? affinity.lastVisitStreak : 0
      },
      remainingChats: user.membershipType === 'free' ? Math.max(0, 5 - user.dailyChatCount) : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

async function generateAIResponse(message, userName, character, chatHistory = [], user) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return `申し訳ありません、AIサービスの設定が完了していないためチャットができません。管理者にお問い合わせください。`;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
