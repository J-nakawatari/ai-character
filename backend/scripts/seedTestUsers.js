const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const Character = require('../models/Character');
const User = require('../models/User');

const uri = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(uri);
  console.log('MongoDB connected');

  // 1. 既存のテストキャラ・ユーザー削除
  await Character.deleteMany({ 'name.ja': { $in: ['テスト無料', 'テストサブスク', 'テスト買い切り'] } });
  await User.deleteMany({ email: { $in: ['test_free@example.com', 'test_sub@example.com', 'test_paid@example.com'] } });

  // 2. テストキャラ作成
  const freeChar = await Character.create({
    name: { ja: 'テスト無料', en: 'Test Free' },
    description: { ja: '無料キャラ', en: 'Free character' },
    characterAccessType: 'free',
    isActive: true
  });
  const subChar = await Character.create({
    name: { ja: 'テストサブスク', en: 'Test Subscription' },
    description: { ja: 'サブスクキャラ', en: 'Subscription character' },
    characterAccessType: 'subscription',
    isActive: true
  });
  const paidChar = await Character.create({
    name: { ja: 'テスト買い切り', en: 'Test PurchaseOnly' },
    description: { ja: '買い切りキャラ', en: 'PurchaseOnly character' },
    characterAccessType: 'purchaseOnly',
    price: 1200,
    purchaseType: 'buy',
    isActive: true
  });

  // 3. テストユーザー作成
  const passwordHash = await bcrypt.hash('test1234', 10);

  await User.create({
    name: '無料テストユーザー',
    email: 'test_free@example.com',
    password: passwordHash,
    membershipType: 'free',
    selectedCharacter: freeChar._id,
    hasCompletedSetup: true
  });

  await User.create({
    name: 'サブスクテストユーザー',
    email: 'test_sub@example.com',
    password: passwordHash,
    membershipType: 'subscription',
    subscriptionStatus: 'active',
    selectedCharacter: subChar._id,
    hasCompletedSetup: true
  });

  await User.create({
    name: '買い切りテストユーザー',
    email: 'test_paid@example.com',
    password: passwordHash,
    membershipType: 'subscription',
    subscriptionStatus: 'active',
    selectedCharacter: paidChar._id,
    hasCompletedSetup: true,
    purchasedCharacters: [{ character: paidChar._id, purchaseType: 'buy', purchaseDate: new Date() }]
  });

  console.log('テストキャラ・ユーザー作成完了');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); }); 