const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB接続成功');
    
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('管理者アカウントは既に存在します');
      process.exit(0);
    }
    
    const admin = new Admin({
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    await admin.save();
    
    console.log('管理者アカウントが作成されました');
    console.log('メールアドレス: admin@example.com');
    console.log('パスワード: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('エラー:', err.message);
    process.exit(1);
  }
};

seedAdmin();
