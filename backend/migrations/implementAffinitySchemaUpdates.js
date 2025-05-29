const mongoose = require('mongoose');
const User = require('../models/User');
const Character = require('../models/Character');

/**
 * 親密度スキーマ拡張のマイグレーション実行
 * 既存データとの互換性を保ちながら新フィールドを追加
 */
async function implementAffinitySchemaUpdates() {
  try {
    console.log('🚀 親密度スキーマ拡張マイグレーション開始...');

    // MongoDB接続確認
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB接続が必要です');
      return { success: false, error: 'MongoDB connection required' };
    }

    // 1. Userコレクションの既存affinitiesデータを更新
    console.log('📊 Userコレクションのaffinitiesフィールド更新中...');
    
    const usersWithAffinities = await User.find({ 
      'affinities.0': { $exists: true } 
    });
    
    console.log(`対象ユーザー数: ${usersWithAffinities.length}`);
    
    let userUpdateCount = 0;
    for (const user of usersWithAffinities) {
      let hasUpdates = false;
      
      for (let affinity of user.affinities) {
        // 新フィールドのデフォルト値設定（既存値がない場合のみ）
        if (affinity.emotionalState === undefined) {
          affinity.emotionalState = 'normal';
          hasUpdates = true;
        }
        
        if (affinity.relationshipType === undefined) {
          // レベルに基づく初期関係性設定
          if (affinity.level >= 80) affinity.relationshipType = 'best_friend';
          else if (affinity.level >= 60) affinity.relationshipType = 'close_friend';
          else if (affinity.level >= 40) affinity.relationshipType = 'friend';
          else if (affinity.level >= 20) affinity.relationshipType = 'acquaintance';
          else affinity.relationshipType = 'stranger';
          hasUpdates = true;
        }
        
        if (affinity.trustLevel === undefined) {
          affinity.trustLevel = Math.min(affinity.level || 0, 100);
          hasUpdates = true;
        }
        
        if (affinity.intimacyLevel === undefined) {
          affinity.intimacyLevel = Math.min(affinity.level || 0, 100);
          hasUpdates = true;
        }
        
        if (affinity.experience === undefined) {
          affinity.experience = (affinity.level || 0) * 10; // レベル×10で概算
          hasUpdates = true;
        }
        
        if (affinity.totalConversations === undefined) {
          affinity.totalConversations = affinity.lastVisitStreak || 0;
          hasUpdates = true;
        }
        
        if (affinity.currentStreak === undefined) {
          affinity.currentStreak = affinity.lastVisitStreak || 0;
          hasUpdates = true;
        }
        
        if (affinity.maxStreak === undefined) {
          affinity.maxStreak = affinity.lastVisitStreak || 0;
          hasUpdates = true;
        }
        
        if (affinity.firstInteractionAt === undefined && affinity.lastInteractedAt) {
          affinity.firstInteractionAt = affinity.lastInteractedAt;
          hasUpdates = true;
        }
        
        // 配列フィールドの初期化
        if (!affinity.favoriteTopics) {
          affinity.favoriteTopics = [];
          hasUpdates = true;
        }
        
        if (!affinity.specialMemories) {
          affinity.specialMemories = [];
          hasUpdates = true;
        }
        
        if (!affinity.giftsReceived) {
          affinity.giftsReceived = [];
          hasUpdates = true;
        }
        
        // デフォルト値設定
        if (affinity.totalGiftsValue === undefined) affinity.totalGiftsValue = 0;
        if (affinity.isFavorite === undefined) affinity.isFavorite = false;
        if (affinity.isBlocked === undefined) affinity.isBlocked = false;
        if (affinity.notificationEnabled === undefined) affinity.notificationEnabled = true;
        if (affinity.privacyLevel === undefined) affinity.privacyLevel = 'private';
        if (affinity.nickname === undefined) affinity.nickname = '';
        if (affinity.averageConversationLength === undefined) affinity.averageConversationLength = 0;
        if (affinity.conversationsToday === undefined) affinity.conversationsToday = 0;
        
        if (!affinity.lastUpdatedAt) {
          affinity.lastUpdatedAt = new Date();
          hasUpdates = true;
        }
      }
      
      if (hasUpdates) {
        await user.save();
        userUpdateCount++;
      }
    }
    
    console.log(`✅ ${userUpdateCount}人のユーザーデータを更新しました`);

    // 2. Characterコレクションの新フィールド初期化
    console.log('🎭 Characterコレクションの新フィールド初期化中...');
    
    const characters = await Character.find({});
    console.log(`対象キャラクター数: ${characters.length}`);
    
    let characterUpdateCount = 0;
    for (const character of characters) {
      let hasUpdates = false;
      
      // galleryImages初期化
      if (!character.galleryImages) {
        character.galleryImages = [];
        hasUpdates = true;
      }
      
      // affinitySettings初期化
      if (!character.affinitySettings) {
        character.affinitySettings = {
          maxLevel: 100,
          experienceMultiplier: 1.0,
          decayRate: 0.1,
          decayThreshold: 7,
          levelUpBonuses: []
        };
        hasUpdates = true;
      }
      
      // levelRewards初期化
      if (!character.levelRewards) {
        character.levelRewards = [];
        hasUpdates = true;
      }
      
      // specialMessages初期化
      if (!character.specialMessages) {
        character.specialMessages = [];
        hasUpdates = true;
      }
      
      // giftPreferences初期化
      if (!character.giftPreferences) {
        character.giftPreferences = [];
        hasUpdates = true;
      }
      
      // affinityStats初期化
      if (!character.affinityStats) {
        character.affinityStats = {
          totalUsers: 0,
          averageLevel: 0,
          maxLevelUsers: 0,
          lastStatsUpdate: new Date()
        };
        hasUpdates = true;
      }
      
      if (hasUpdates) {
        await character.save();
        characterUpdateCount++;
      }
    }
    
    console.log(`✅ ${characterUpdateCount}個のキャラクターデータを更新しました`);

    // 3. 統計更新
    console.log('📈 親密度統計の更新中...');
    await updateAffinityStats();

    console.log('🎉 親密度スキーマ拡張マイグレーション完了！');
    
    return {
      success: true,
      message: '親密度スキーマ拡張が完了しました',
      stats: {
        usersUpdated: userUpdateCount,
        charactersUpdated: characterUpdateCount,
        totalUsers: usersWithAffinities.length,
        totalCharacters: characters.length
      }
    };

  } catch (error) {
    console.error('❌ マイグレーションエラー:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * キャラクター別親密度統計を更新
 */
async function updateAffinityStats() {
  try {
    const characters = await Character.find({});
    
    for (const character of characters) {
      // そのキャラクターとの親密度を持つユーザーを取得
      const usersWithAffinity = await User.find({
        'affinities.character': character._id
      });
      
      if (usersWithAffinity.length > 0) {
        const affinityLevels = usersWithAffinity
          .map(user => {
            const affinity = user.affinities.find(a => 
              a.character.toString() === character._id.toString()
            );
            return affinity ? affinity.level : 0;
          })
          .filter(level => level > 0);
        
        const totalUsers = affinityLevels.length;
        const averageLevel = totalUsers > 0 ? 
          affinityLevels.reduce((sum, level) => sum + level, 0) / totalUsers : 0;
        const maxLevelUsers = affinityLevels.filter(level => level >= 95).length;
        
        // 統計更新
        character.affinityStats = {
          totalUsers,
          averageLevel: Math.round(averageLevel * 10) / 10,
          maxLevelUsers,
          lastStatsUpdate: new Date()
        };
        
        await character.save();
      }
    }
    
    console.log('📊 親密度統計の更新完了');
    
  } catch (error) {
    console.error('統計更新エラー:', error);
    throw error;
  }
}

// 実行
if (require.main === module) {
  // MongoDB接続
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-character';
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('📦 MongoDB接続成功');
      return implementAffinitySchemaUpdates();
    })
    .then(result => {
      console.log('🏁 マイグレーション結果:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 実行エラー:', error);
      process.exit(1);
    });
}

module.exports = { implementAffinitySchemaUpdates, updateAffinityStats };