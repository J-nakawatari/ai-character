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
      
      isLimitReached = user.dailyChatCount >= 1;
      remainingChats = Math.max(0, 1 - user.dailyChatCount);
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
      
      // 制限メッセージを作成（DBに設定されていない場合はデフォルト）
      const limitMessageContent = adminLimitMessage && adminLimitMessage.trim() 
        ? adminLimitMessage 
        : '無料会員は1日1回までチャットできます。プレミアム会員になると制限が解除されます。';
      
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
    if (isLimitReached && user.membershipType === 'free') {
      const locale = user.preferredLanguage || 'ja';
      const adminLimitMessage = getString(character.limitMessage, locale);
      limitMessageContent = adminLimitMessage && adminLimitMessage.trim() 
        ? adminLimitMessage 
        : '無料会員は1日1回までチャットできます。プレミアム会員になると制限が解除されます。';
    }

    res.json({
      ...chat.toObject(),
      isLimitReached,
      remainingChats,
      limitMessage: limitMessageContent
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
      
      // 1日1回の制限をチェック
      if (user.dailyChatCount >= 1) {
        const locale = user.preferredLanguage || 'ja';
        const adminLimitMessage = getString(character.limitMessage, locale);
        
        // DBに制限メッセージが設定されている場合はそれを使用、なければデフォルトメッセージ
        const limitMsg = adminLimitMessage && adminLimitMessage.trim() 
          ? adminLimitMessage 
          : '無料会員は1日1回までチャットできます。プレミアム会員になると制限が解除されます。';
          
        return res.status(429).json({ 
          msg: limitMsg,
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

    // ユーザー会員タイプに応じてモデルとパラメータを選択
    const isSubscriptionUser = user.membershipType === 'subscription' && user.subscriptionStatus === 'active';
    const modelConfig = {
      model: isSubscriptionUser ? "gpt-4" : "gpt-3.5-turbo",
      max_tokens: isSubscriptionUser ? 200 : 150,
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
      remainingChats: user.membershipType === 'free' ? Math.max(0, 1 - user.dailyChatCount) : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
