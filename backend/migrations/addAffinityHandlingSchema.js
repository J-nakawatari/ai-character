const mongoose = require('mongoose');
const User = require('../models/User');
const Character = require('../models/Character');

// 親密度取扱機能のためのスキーマ追加マイグレーション
async function addAffinityHandlingSchema() {
  try {
    console.log('親密度取扱機能のスキーマ追加を開始...');

    // Userモデルのaffinitiesスキーマに新しいフィールドを追加
    const userAffinityFields = {
      // 経験値システム
      experience: { type: Number, default: 0 }, // 累計経験値
      experienceToday: { type: Number, default: 0 }, // 今日の経験値
      experienceThisWeek: { type: Number, default: 0 }, // 今週の経験値
      lastExperienceReset: { type: Date, default: new Date() }, // 最後のリセット日
      
      // 会話統計
      totalConversations: { type: Number, default: 0 }, // 総会話数
      averageConversationLength: { type: Number, default: 0 }, // 平均会話長
      longestConversation: { type: Number, default: 0 }, // 最長会話数
      conversationsToday: { type: Number, default: 0 }, // 今日の会話数
      
      // 感情・関係性
      emotionalState: { 
        type: String, 
        enum: ['happy', 'normal', 'sad', 'excited', 'angry', 'shy', 'loving'],
        default: 'normal' 
      }, // 現在の感情状態
      relationshipType: {
        type: String,
        enum: ['stranger', 'acquaintance', 'friend', 'close_friend', 'best_friend', 'lover', 'soulmate'],
        default: 'stranger'
      }, // 関係性タイプ
      trustLevel: { type: Number, default: 0, min: 0, max: 100 }, // 信頼度
      intimacyLevel: { type: Number, default: 0, min: 0, max: 100 }, // 親密度
      
      // 活動履歴
      firstInteractionAt: { type: Date, default: null }, // 初回対話日
      lastGiftGivenAt: { type: Date, default: null }, // 最後のギフト日
      lastSpecialEventAt: { type: Date, default: null }, // 最後の特別イベント日
      currentStreak: { type: Number, default: 0 }, // 現在の連続日数
      maxStreak: { type: Number, default: 0 }, // 最大連続日数
      
      // ユーザー設定・記憶
      nickname: { type: String, default: '' }, // ユーザーが設定したニックネーム
      favoriteTopics: [{ type: String }], // お気に入りの話題
      specialMemories: [{
        event: { type: String, required: true },
        date: { type: Date, default: Date.now },
        importance: { type: Number, default: 1, min: 1, max: 5 }
      }], // 特別な記憶
      
      // ギフト・アイテム履歴
      giftsReceived: [{
        giftType: { type: String, required: true },
        giftName: { type: String, required: true },
        receivedAt: { type: Date, default: Date.now },
        value: { type: Number, default: 0 }
      }],
      totalGiftsValue: { type: Number, default: 0 }, // 総ギフト価値
      
      // 達成・マイルストーン
      achievements: [{
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        description: { type: String, default: '' }
      }],
      milestones: [{
        milestoneType: { type: String, required: true }, // 'level_10', 'first_week', etc.
        reachedAt: { type: Date, default: Date.now },
        reward: { type: String, default: '' }
      }],
      
      // 設定・フラグ
      isBlocked: { type: Boolean, default: false }, // ブロック状態
      isFavorite: { type: Boolean, default: false }, // お気に入り設定
      notificationEnabled: { type: Boolean, default: true }, // 通知設定
      privacyLevel: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'private'
      }, // プライバシー設定
      
      // メタデータ
      version: { type: Number, default: 1 }, // スキーマバージョン
      lastUpdatedAt: { type: Date, default: Date.now },
      migrationFlags: {
        hasV2Schema: { type: Boolean, default: true },
        hasAffinityHandling: { type: Boolean, default: true }
      }
    };

    // Characterモデルに追加するフィールド
    const characterAffinityFields = {
      // ギャラリー画像（ダッシュボード用）
      galleryImages: [{
        url: { type: String, required: true },
        unlockLevel: { type: Number, default: 0, min: 0, max: 100 },
        title: { 
          ja: { type: String, default: '' },
          en: { type: String, default: '' }
        },
        description: {
          ja: { type: String, default: '' },
          en: { type: String, default: '' }
        },
        rarity: {
          type: String,
          enum: ['common', 'rare', 'epic', 'legendary'],
          default: 'common'
        },
        tags: [{ type: String }], // 'casual', 'formal', 'seasonal', etc.
        isDefault: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
      }],
      
      // 親密度設定
      affinitySettings: {
        maxLevel: { type: Number, default: 100 },
        experienceMultiplier: { type: Number, default: 1.0 },
        decayRate: { type: Number, default: 0.1 }, // 1日あたりの減衰率
        decayThreshold: { type: Number, default: 7 }, // 減衰開始日数
        levelUpBonuses: [{
          level: { type: Number, required: true },
          bonus: { type: String, required: true }, // 'image_unlock', 'special_message', etc.
          value: { type: String, default: '' }
        }]
      },
      
      // レベル別解放コンテンツ
      levelRewards: [{
        level: { type: Number, required: true },
        rewardType: {
          type: String,
          enum: ['image', 'voice', 'message', 'feature'],
          required: true
        },
        rewardId: { type: String, required: true },
        title: {
          ja: { type: String, default: '' },
          en: { type: String, default: '' }
        },
        description: {
          ja: { type: String, default: '' },
          en: { type: String, default: '' }
        }
      }],
      
      // 特別メッセージ
      specialMessages: [{
        triggerType: {
          type: String,
          enum: ['level_up', 'first_meeting', 'birthday', 'anniversary', 'gift_received'],
          required: true
        },
        level: { type: Number, default: 0 }, // レベル条件
        message: {
          ja: { type: String, required: true },
          en: { type: String, default: '' }
        },
        isActive: { type: Boolean, default: true }
      }],
      
      // ギフト設定
      giftPreferences: [{
        giftType: { type: String, required: true },
        preference: {
          type: String,
          enum: ['loves', 'likes', 'neutral', 'dislikes', 'hates'],
          default: 'neutral'
        },
        affinityBonus: { type: Number, default: 0 }, // 親密度ボーナス
        specialResponse: {
          ja: { type: String, default: '' },
          en: { type: String, default: '' }
        }
      }],
      
      // 統計・メタデータ
      affinityStats: {
        totalUsers: { type: Number, default: 0 },
        averageLevel: { type: Number, default: 0 },
        maxLevelUsers: { type: Number, default: 0 },
        lastStatsUpdate: { type: Date, default: Date.now }
      }
    };

    console.log('新しいフィールド定義を作成しました');
    console.log('追加される親密度関連フィールド数:', Object.keys(userAffinityFields).length);
    console.log('追加されるキャラクター関連フィールド数:', Object.keys(characterAffinityFields).length);

    // 実際のマイグレーション処理は手動で行う
    console.log('\n=== マイグレーション手順 ===');
    console.log('1. 本番環境では必ずバックアップを取得してください');
    console.log('2. User.jsモデルのaffinitiesスキーマに上記フィールドを追加');
    console.log('3. Character.jsモデルに上記フィールドを追加');
    console.log('4. 既存データの互換性確認');
    console.log('5. インデックスの作成（必要に応じて）');

    console.log('\n=== 推奨インデックス ===');
    console.log('db.users.createIndex({"affinities.level": -1})');
    console.log('db.users.createIndex({"affinities.lastInteractedAt": -1})');
    console.log('db.characters.createIndex({"galleryImages.unlockLevel": 1})');
    
    return {
      userAffinityFields,
      characterAffinityFields,
      success: true,
      message: '親密度取扱スキーマ定義が完了しました'
    };

  } catch (error) {
    console.error('スキーマ追加エラー:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 実行
if (require.main === module) {
  addAffinityHandlingSchema()
    .then(result => {
      console.log('結果:', result.message);
      process.exit(0);
    })
    .catch(error => {
      console.error('実行エラー:', error);
      process.exit(1);
    });
}

module.exports = addAffinityHandlingSchema;