// 無料テストユーザー
const freeUser = await User.create({
  name: '無料テストユーザー',
  email: 'test_free@example.com',
  password: passwordHash,
  membershipType: 'free',
  subscriptionStatus: 'inactive',  // 明示的に'inactive'を指定
  selectedCharacter: freeChar._id,
  hasCompletedSetup: true
}); 