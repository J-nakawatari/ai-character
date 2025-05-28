const { test, expect } = require('@playwright/test');

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // 新規登録ページでテストユーザーを作成
    await page.goto('http://localhost:3000/ja/register');
    await page.getByPlaceholder('お名前を入力してください').fill('テストユーザー');
    await page.getByPlaceholder('メールアドレスを入力してください').fill('test@example.com');
    await page.getByPlaceholder('パスワードを入力してください').fill('password123');
    await page.getByRole('button', { name: '登録する' }).click();
    // 登録後にダッシュボード等に遷移する場合は待機
    // await expect(page).toHaveURL('/dashboard');
    // ログアウトしてテスト開始状態に戻す
    // （必要に応じて実装）
    await page.goto('/');
  });

  test('ログイン成功', async ({ page }) => {
    // ログインボタンをクリック
    await page.getByRole('link', { name: 'ログイン' }).click();

    // ログインフォームが表示されることを確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();

    // メールアドレスとパスワードを入力
    await page.getByPlaceholder('メールアドレスを入力してください').fill('test@example.com');
    await page.getByPlaceholder('パスワードを入力してください').fill('password123');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ダッシュボードに遷移することを確認
    await expect(page).toHaveURL('/ja/setup');
  });

  test('未登録メールアドレスでログイン失敗', async ({ page }) => {
    await page.getByRole('link', { name: 'ログイン' }).click();
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await page.getByPlaceholder('メールアドレスを入力してください').fill('wrong@example.com');
    await page.getByPlaceholder('パスワードを入力してください').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForSelector('text=このアカウントは登録されていません', { timeout: 15000 });
    await expect(page.getByText(/このアカウントは登録されていません/)).toBeVisible();
  });

  test('登録済みメールアドレス＋間違ったパスワードでログイン失敗', async ({ page }) => {
    await page.getByRole('link', { name: 'ログイン' }).click();
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await page.getByPlaceholder('メールアドレスを入力してください').fill('test@example.com');
    await page.getByPlaceholder('パスワードを入力してください').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForSelector('text=メールアドレスまたはパスワードが正しくありません', { timeout: 15000 });
    await expect(page.getByText(/メールアドレスまたはパスワードが正しくありません/)).toBeVisible();
  });

  test('ログアウト', async ({ page }) => {
    // ログイン状態にする
    await page.goto('/login');
    await page.getByPlaceholder('メールアドレスを入力してください').fill('test@example.com');
    await page.getByPlaceholder('パスワードを入力してください').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ダッシュボードにいることを確認
    await expect(page).toHaveURL('/ja/setup');

    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // トップページに戻ることを確認
    await expect(page).toHaveURL('/ja/login');
  });
}); 