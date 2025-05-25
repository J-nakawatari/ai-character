# AGENTS.md - プロジェクト方針とルール

## グローバル開発ルール

- 管理画面（/admin）は i18n 対象外。日本語固定とし、翻訳対応は不要。
- `.env` は環境依存とする。仮定値として以下を想定：
  - MONGO_URI=your_mongo_uri_here
- ディレクトリ構成は以下の通りとする：
  - backend = Express API
  - frontend = Next.js App Router

## Lint に関する注意

- フロントエンドの `lint` スクリプトは `/frontend/package.json` に定義されています。
- そのため、`npm run lint` を実行する際は、必ず `/frontend` ディレクトリに移動してから実行してください：

  cd frontend
  npm run lint

- ルートディレクトリでは `lint` スクリプトは定義されていないため、CodexやCI環境では失敗しても構いません。
- セットアップスクリプトでは、必要に応じて仮の `lint` スクリプトを自動挿入する処理があります。

## PR 作成ルール

- プルリクエストの概要には「目的 + 技術的背景」を明記してください。
- 作業ブランチの命名規則は以下の通りです：
  - feature/  新機能
  - fix/      バグ修正
  - chore/    その他メンテナンス系

## その他

- Codex には上記方針に準拠したコード生成・修正・補完を期待します。
- Codex はルートディレクトリではなく、frontend または backend に移動してから各種コマンドを実行してください。
- Codexは新しいブランチを作成する前に、必ず最新の main ブランチを `git pull` してから作業を始めてください。