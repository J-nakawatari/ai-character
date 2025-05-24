# AGENTS.md - プロジェクト方針とルール

## グローバル開発ルール

- 管理画面（/admin）はi18n対象外、日本語固定。
- Lint失敗は無視可能。Codex環境では `npm run lint` が失敗しても構わない。
- `.env` の仮定値：
  - MONGO_URI=your_mongo_uri_here
- ディレクトリ構成：backend = Express API / frontend = Next.js App Router

## PR作成ルール

- 変更内容を「概要 + 技術的背景」で記述する。
- 作業用ブランチ名は `feature/`, `fix/`, `chore/` などで分類。

## その他

- Codexにはこの方針に沿ったコード生成と修正を期待します。
