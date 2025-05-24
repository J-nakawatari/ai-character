const mongoose = require('mongoose');
const User = require('./models/User');
const Character = require('./models/Character');
require('dotenv').config();

const seedPurchases = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB接続成功');
    
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('ユーザーが見つかりません');
      process.exit(1);
    }
    
    const characters = await Character.find();
    
    if (characters.length === 0) {
      console.log('キャラクターが見つかりません');
      process.exit(1);
    }
    
    for (const user of users) {
      if (user.selectedCharacter) {
        const alreadyPurchased = user.purchasedCharacters && user.purchasedCharacters.some(
          pc => pc.character && pc.character.toString() === user.selectedCharacter.toString()
        );
        
        if (!alreadyPurchased) {
          if (!user.purchasedCharacters) {
            user.purchasedCharacters = [];
          }
          
          user.purchasedCharacters.push({
            character: user.selectedCharacter,
            purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1週間前
            purchaseType: 'buy'
          });
        }
      }
      
      const numToAdd = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...characters].sort(() => 0.5 - Math.random());
      
      if (!user.purchasedCharacters) {
        user.purchasedCharacters = [];
      }
      
      for (let i = 0; i < numToAdd && i < shuffled.length; i++) {
        const character = shuffled[i];
        
        const alreadyPurchased = user.purchasedCharacters.some(
          pc => pc.character && pc.character.toString() === character._id.toString()
        );
        
        if (!alreadyPurchased) {
          user.purchasedCharacters.push({
            character: character._id,
            purchaseDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // 過去30日以内
            purchaseType: character.isPremium ? 'subscription' : 'buy'
          });
        }
      }
      
      if (Math.random() < 0.3) {
        user.membershipType = 'premium';
        user.subscriptionStatus = 'active';
        user.subscriptionStartDate = new Date();
        user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日後
      } else {
        user.membershipType = 'free';
        user.subscriptionStatus = 'active';
        user.subscriptionStartDate = null;
        user.subscriptionEndDate = null;
      }
      
      user.lastLoginDate = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000); // 過去7日以内
      
      await user.save();
      console.log(`ユーザー ${user.name} の購入情報を更新しました`);
    }
    
    console.log('すべてのユーザーの購入情報を更新しました');
    process.exit(0);
  } catch (err) {
    console.error('エラー:', err);
    process.exit(1);
  }
};

seedPurchases();
