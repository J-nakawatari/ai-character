# 翻訳ファイルの名前空間修正

## 問題点
ダッシュボードページとチャットページで以下のエラーが発生していました：
- `MISSING_MESSAGE: Could not resolve 'dashboard' in messages for locale 'ja'`
- `MISSING_MESSAGE: Could not resolve 'chat' in messages for locale 'ja'`

これは翻訳ファイル（ja.json, en.json）から'dashboard'と'chat'名前空間が削除されていたことが原因です。

## 修正内容
1. 日本語の翻訳ファイル（ja.json）に'dashboard'と'chat'名前空間を追加
2. 英語の翻訳ファイル（en.json）に'dashboard'と'chat'名前空間を追加

## テスト結果
以下の機能をテストし、正常に動作することを確認しました：
- キャラクター選択画面（/ja/setup）の表示
- 「このキャラクターを選択する」ボタンのクリック
- ダッシュボードページ（/ja/dashboard）へのリダイレクト
- ダッシュボードページでの翻訳エラーが解消されていることを確認
- チャットページ（/ja/chat）の表示と翻訳エラーが解消されていることを確認

## スクリーンショット
キャラクター選択画面:
![キャラクター選択画面](/home/ubuntu/screenshots/localhost_3000_ja_090047.png)

## Link to Devin run
https://app.devin.ai/sessions/5dd03c64877946e88e868ee00b6e0a75

## Requested by
アルパカエル
