import axios from 'axios';

// 環境変数から API エンドポイントを取得。存在しない場合はフロントエンドと同じドメインの `/api` を利用
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Needed for cookies
});

// レスポンスインターセプターを追加
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !error.config?.skipAuthRedirect
    ) {
      const current = window.location.pathname;
      if (current.startsWith('/admin')) {
        if (current !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        const localeMatch = current.match(/^\/(ja|en)(\/|$)/);
        const locale = localeMatch ? localeMatch[1] : null;
        const loginPath = locale ? `/${locale}/login` : '/login';
        if (current !== loginPath) {
          window.location.href = loginPath;
        }
      }
    }
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
