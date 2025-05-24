# 開発ガイドライン（dev-guidelines.md）

このリポジトリは、Next.js（フロントエンド） + Express（バックエンド） + MongoDB で構成されたフルスタックアプリケーションです。このドキュメントでは、開発方針・制約・ルールなど、新規開発者やコントリビューターが遵守すべきポイントをまとめています。
確認、報告、連絡、進捗状況はすべて日本語で表示してください。
作業刷る前には必ずmainブランチから新しく作業用ブランチを作ってくだあい。

---

## 1. 多言語対応（i18n）

### ✅ 多言語対応する範囲

- ユーザー向けのフロントエンド画面（例：ログイン、チャット、ダッシュボードなど）は、**日本語（ja）と英語（en）**に対応します。
- 多言語対応には `next-i18next` を使用し、対応リソースは `frontend/messages/` に配置されています。

### ❌ 多言語非対応の範囲

- 管理者画面（`/admin/*` 配下）は、**日本語のみ対応**とします。
  - 多言語化の必要はありません。
  - i18n関数（例：`t()`）の使用は禁止。
  - 表示言語の一貫性のため、日本語で記述してください。

---

## 2. ディレクトリ構成（概要）

```
ai-character-service/
├── backend/     # Express + MongoDB（API, モデル, ミドルウェア等）
├── frontend/    # Next.js + i18n（UI, ページ, ロジック）
├── dev-guidelines.md  # このガイドラインファイル
```

---

## 3. 環境構築手順（概要）

1. `backend/` と `frontend/` それぞれで依存関係をインストール：
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. `.env` ファイルを設定（必要な変数例）：
   - `MONGO_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_API_URL` （フロントエンド用、デフォルトは `http://localhost:5000/api`）
   - サンプル設定ファイル: `backend/.env.example` と `frontend/.env.example`

3. 開発サーバーの起動：
   - バックエンド: `cd backend && npm run dev`
   - フロントエンド: `cd frontend && npm run dev`

---

## 4. ドキュメント参照・運用について（Cursor / Codex）

### GitHub + Cursor Docs の連携手順

1. この `dev-guidelines.md` を GitHub リポジトリにアップロード
2. ファイルの **Raw URL** を取得  
   例:  
   ```
   https://raw.githubusercontent.com/your-username/your-repo-name/main/dev-guidelines.md
   ```
3. Cursor の Docs 設定で `+ Add new doc` をクリックし、上記URLを `Entrypoint` に貼り付けて登録

> ✅ 登録後は、AIがこのガイドラインを理解し、プロンプトに沿った開発が可能になります。

---

## 5. 今後追加予定のルール（例）

- API 命名規則・レスポンスフォーマット
- データスキーマ仕様（ユーザー、キャラクター、管理者など）
- 管理者機能の制限と許可範囲
- PR/コミットメッセージのフォーマット

---

## 6. ルーティングに関するルール

このセクションでは、APIルートおよびフロントエンドのページルートに関する設計方針を定義します。

### ✅ 方針（ルーティングルールの集約管理）

- **ルーティングに関するすべてのルール・命名規則は、本セクションに一元的に記述・更新します。**
- 仕様や設計が変わった場合は、まずこのドキュメントを更新してから実装を行ってください。
- 他ファイル（READMEやコメント等）にルールを分散しないこと。

---

### ✅ APIルーティング（`backend/`）

- RESTful 原則に従う
  ```
  GET    /api/users         → ユーザー一覧取得
  POST   /api/users         → ユーザー作成
  PUT    /api/users/:id     → ユーザー更新
  DELETE /api/users/:id     → ユーザー削除
  ```

- 管理者用のAPIは `/api/admin/*` に集約し、認証ミドルウェアで保護する
- 将来的に `/api/v2/*` などのバージョン分離も許容する設計にしておく

---

### ✅ フロントエンドルーティング（`frontend/`）

- Next.js App Router（`/app/`）構成を採用。ファイルベースルーティングが基本
  ```
  app/login/page.js         → ログイン画面
  app/dashboard/page.js     → ダッシュボード
  app/admin/users/page.js   → 管理者用 ユーザー管理ページ
  ```

- 管理者用ページは `/admin` 配下に統一（ユーザー向け画面と分離）
- ルート設計に関する補足情報や変更履歴も本セクションに記載すること

---

### ❌ 禁止事項

- フロントエンドにおける明示的な `next.config.js rewrites` による独自ルーティングは原則禁止（特殊事情がある場合はこのセクションに理由を明記）
- `/admin` 配下で i18n リソースの使用（`t()` 呼び出し）は禁止

---

## 最終更新

- 作成日：2025年5月24日
- 作成者：プロジェクト管理チーム
