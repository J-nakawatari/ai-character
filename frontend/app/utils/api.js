import axios from 'axios';

// 環境変数から API エンドポイントを取得。存在しない場合はローカル開発用 URL を利用
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Needed for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// レスポンスインターセプターを追加
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
