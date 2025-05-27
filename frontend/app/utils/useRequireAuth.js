import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth';
import GlobalLoading from '../components/GlobalLoading';

/**
 * 認証必須ページで利用する共通フック
 * - loading中はローディング表示
 * - 未認証ならログインページへリダイレクト
 * - userが存在すればuserを返す
 */
export default function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return { user: null, loading: true, element: <GlobalLoading text="認証確認中..." /> };
  }
  if (!user) {
    return { user: null, loading: false, element: null };
  }
  return { user, loading: false, element: null };
} 