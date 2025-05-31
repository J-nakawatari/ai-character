const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Character = require('../models/Character');
const OpenAI = require('openai');
const { updateAffinity, getToneStyle } = require('../utils/affinity');
const { generatePersonalityPrompt } = require('../utils/personalityPrompt');

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

    // 新しいトークン制での制限状態をチェック
    let isLimitReached = false;
    let remainingFreeChats = null;
    let tokenBalance = user.tokenBalance;
    
    const today = new Date();
    const lastResetDate = user.lastFreeChatResetAt ? new Date(user.lastFreeChatResetAt) : null;
    
    // 日付が変わった場合は無料チャット回数をリセット
    if (!lastResetDate || today.toDateString() !== lastResetDate.toDateString()) {
      user.dailyFreeChatCount = 0;
      user.lastFreeChatResetAt = today;
      await user.save();
    }
    
    if (character.isBaseCharacter) {
      isLimitReached = user.dailyFreeChatCount >= 5;
      remainingFreeChats = Math.max(0, 5 - user.dailyFreeChatCount);
    }

    // 旧来の制限チェックは残しつつ、新しいトークン制と併用
    
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
    if (isLimitReached && character.isBaseCharacter) {
      const locale = user.preferredLanguage || 'ja';
      // 管理画面で設定された制限メッセージを取得
      const adminLimitMessage = getString(character.limitMessage, locale);
      
      // 制限メッセージを作成（DBに設定されていない場合はデフォルト）
      const limitMessageContent = adminLimitMessage && adminLimitMessage.trim() 
        ? adminLimitMessage 
        : '無料キャラクターは1日5回までチャットできます。';
      
      const limitMessage = {
        sender: 'ai',
        content: limitMessageContent,
        timestamp: new Date(),
        isLimitMessage: true
      };
      
      // 既に制限メッセージがある場合は追加しない（過去24時間以内）
      const hasRecentLimitMessage = chat.messages.some(msg => {
        if (!msg.isLimitMessage) return false;
        const msgTime = new Date(msg.timestamp);
        const now = new Date();
        const hoursDiff = (now - msgTime) / (1000 * 60 * 60);
        return hoursDiff < 24; // 24時間以内の制限メッセージがあるかチェック
      });
      
      if (!hasRecentLimitMessage) {
        chat.messages.push(limitMessage);
        await chat.save();
      }
    }
    
    // 制限メッセージを取得
    let limitMessageContent = null;
    if (isLimitReached && character.isBaseCharacter) {
      const locale = user.preferredLanguage || 'ja';
      const adminLimitMessage = getString(character.limitMessage, locale);
      limitMessageContent = adminLimitMessage && adminLimitMessage.trim() 
        ? adminLimitMessage 
        : '無料キャラクターは1日5回までチャットできます。';
    }

    res.json({
      ...chat.toObject(),
      isLimitReached,
      remainingFreeChats,
      tokenBalance,
      limitMessage: limitMessageContent,
      isBaseCharacter: character.isBaseCharacter
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

    // 新しいトークン制ロジック
    const today = new Date();
    const lastResetDate = user.lastFreeChatResetAt ? new Date(user.lastFreeChatResetAt) : null;
    
    // 日付が変わった場合は無料チャット回数をリセット
    if (!lastResetDate || today.toDateString() !== lastResetDate.toDateString()) {
      user.dailyFreeChatCount = 0;
      user.lastFreeChatResetAt = today;
      await user.save();
    }

    // キャラクターのタイプに応じた制限チェック
    if (character.isBaseCharacter) {
      // 無料キャラクター：1日5回まで
      if (user.dailyFreeChatCount >= 5) {
        const locale = user.preferredLanguage || 'ja';
        const adminLimitMessage = getString(character.limitMessage, locale);
        
        const limitMsg = adminLimitMessage && adminLimitMessage.trim() 
          ? adminLimitMessage 
          : '無料キャラクターは1日5回までチャットできます。';
          
        return res.status(429).json({ 
          msg: limitMsg,
          isLimitReached: true,
          remainingFreeChats: 0
        });
      }
    } else {
      // 課金キャラクター：トークン必要（暫定で150トークン消費と仮定）
      const requiredTokens = character.model === 'gpt-4' ? 300 : 150;
      
      if (user.tokenBalance < requiredTokens) {
        return res.status(402).json({ 
          msg: 'トークンが不足しています。チャージしてください。',
          requiredTokens,
          currentBalance: user.tokenBalance
        });
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
    
    // 新しい性格ベースプロンプト生成
    const enhancedPrompt = generatePersonalityPrompt(character, locale, affinityLevel, toneStyle);

    // キャラクターのモデル設定に応じて選択
    const modelConfig = {
      model: character.model || "gpt-3.5-turbo",
      max_tokens: character.isBaseCharacter ? 150 : 200,
      temperature: 0.7
    };

    const completion = await openai.chat.completions.create({
      ...modelConfig,
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
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    // AIの応答を保存
    chat.messages.push({
      sender: 'ai',
      content: aiReply,
      timestamp: new Date()
    });
    
    await chat.save();
    
    // トークン消費とカウント処理
    let remainingFreeChats = null;
    let tokenBalance = user.tokenBalance;
    
    if (character.isBaseCharacter) {
      // 無料キャラクター：回数をカウントアップ
      user.dailyFreeChatCount += 1;
      remainingFreeChats = Math.max(0, 5 - user.dailyFreeChatCount);
    } else {
      // 課金キャラクター：実際のトークン消費
      const actualTokenCost = Math.max(tokensUsed, 50); // 最低50トークンは消費
      user.tokenBalance = Math.max(0, user.tokenBalance - actualTokenCost);
      tokenBalance = user.tokenBalance;
    }
    
    await user.save();
    
    res.json({ 
      reply: aiReply,
      affinity: {
        level: affinityLevel,
        streak: affinity ? affinity.lastVisitStreak : 0
      },
      remainingFreeChats,
      tokenBalance,
      tokensUsed: character.isBaseCharacter ? 0 : tokensUsed,
      isBaseCharacter: character.isBaseCharacter
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
