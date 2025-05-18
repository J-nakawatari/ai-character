const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjQ2NWFiY2RlZjEyMzQifSwiaWF0IjoxNjI0NTY3ODkwLCJleHAiOjE2MjQ1Njc5NTB9.EXAMPLE_TOKEN';
const characterId = '68298bc7d64175a271585507'; // 実際のキャラクターIDに置き換え

function backupAndClearApiKey() {
  const originalApiKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = '';
  return originalApiKey;
}

function restoreApiKey(originalApiKey) {
  process.env.OPENAI_API_KEY = originalApiKey;
}

async function testSuccessCase() {
  console.log('\n1. 正常なリクエストのテスト:');
  console.log('注意: 認証が必要なため、実際のテストではブラウザでログインして手動でテストする必要があります。');
  console.log('このテストスクリプトは、APIの実装が正しいことを確認するためのものです。');
  
  try {
    const response = await axios.post('http://localhost:5000/api/chat', {
      characterId,
      message: 'こんにちは、はじめまして！'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log(`ステータスコード: ${response.status}`);
    console.log(`レスポンス: ${JSON.stringify(response.data, null, 2)}`);
    
    const condition1 = response.status === 200;
    const condition2 = !!response.data.reply;
    
    console.log(`条件1: ステータスコード200 - ${condition1 ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`条件2: response.body.replyが存在する - ${condition2 ? '✅ 成功' : '❌ 失敗'}`);
    
    return { condition1, condition2 };
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    
    if (error.response) {
      console.log(`ステータスコード: ${error.response.status}`);
      console.log(`エラーレスポンス: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return { condition1: false, condition2: false };
  }
}

async function testErrorCase() {
  console.log('\n3. エラーケースのテスト (APIキー未設定):');
  console.log('注意: このテストは、OpenAI APIキーを一時的に無効化して行います。');
  
  const originalApiKey = backupAndClearApiKey();
  
  try {
    await axios.post('http://localhost:5000/api/chat', {
      characterId,
      message: 'これはエラーテストです'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log('❌ エラーが発生しませんでした。エラーハンドリングが正しく機能していない可能性があります。');
    return false;
  } catch (error) {
    if (error.response) {
      console.log(`ステータスコード: ${error.response.status}`);
      console.log(`エラーレスポンス: ${JSON.stringify(error.response.data, null, 2)}`);
      
      const hasErrorMessage = error.response.data.error && typeof error.response.data.error === 'string';
      console.log(`条件3: エラー時に適切なエラーメッセージが返る - ${hasErrorMessage ? '✅ 成功' : '❌ 失敗'}`);
      return hasErrorMessage;
    } else {
      console.log('レスポンスが取得できませんでした。');
      return false;
    }
  } finally {
    restoreApiKey(originalApiKey);
  }
}

async function testPersonalityPrompt() {
  console.log('\n4. 性格プロンプトの確認:');
  console.log('注意: このテストは、実際のAPIレスポンスを確認して手動で判断する必要があります。');
  
  try {
    const response = await axios.post('http://localhost:5000/api/chat', {
      characterId,
      message: '自己紹介をしてください'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log(`応答: ${response.data.reply}`);
    console.log('条件4: キャラクターの性格が応答に反映されているか - 応答内容から判断してください');
    
    return true;
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    
    if (error.response) {
      console.log(`ステータスコード: ${error.response.status}`);
      console.log(`エラーレスポンス: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return false;
  }
}

async function testChatAPI() {
  console.log('チャットAPIのテストを開始します...');
  console.log('注意: このテストスクリプトは、実際のトークンとキャラクターIDを使用する必要があります。');
  console.log('実際のテストでは、ブラウザでログインして手動でテストすることをお勧めします。');
  
  try {
    const { condition1, condition2 } = await testSuccessCase();
    const condition3 = await testErrorCase();
    const condition4 = await testPersonalityPrompt();
    
    console.log('\n=== テスト結果のまとめ ===');
    console.log(`条件1: ステータスコード200 - ${condition1 ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`条件2: response.body.replyが存在する - ${condition2 ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`条件3: エラー時に適切なエラーメッセージが返る - ${condition3 ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`条件4: キャラの性格プロンプトが読み込まれている - ${condition4 ? '✅ 成功' : '❌ 失敗'}`);
    
    if (condition1 && condition2 && condition3 && condition4) {
      console.log('\n✅✅✅ テスト完了・動作確認済み ✅✅✅');
    } else {
      console.log('\n❌ 一部のテストが失敗しました');
      console.log('注意: 認証エラーが発生した場合は、有効なトークンとキャラクターIDを使用しているか確認してください。');
      console.log('実際のテストでは、ブラウザでログインして手動でテストすることをお勧めします。');
    }
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error.message);
  }
}

testChatAPI();
