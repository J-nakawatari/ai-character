'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { mockUser, mockCharacters } from './mockData';

// モック認証コンテキストを作成
const MockAuthContext = createContext();

// モック認証プロバイダーコンポーネント
export function MockAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期化時にモックユーザーデータをロード
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500); // 読み込み中の状態を再現するために少し遅延させる
  }, []);

  // ログイン処理のモック実装
  const login = async (email, password) => {
    setLoading(true);
    try {
      // テスト用のユーザー認証
      if (email === 'test@example.com' && password === 'password123') {
        setUser(mockUser);
        return { success: true };
      }
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    } catch (err) {
      return { success: false, error: 'ログイン処理中にエラーが発生しました' };
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理のモック実装
  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'ログアウト処理中にエラーが発生しました' };
    } finally {
      setLoading(false);
    }
  };

  // 登録処理のモック実装
  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = {
        ...mockUser,
        name: userData.name,
        email: userData.email
      };
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: '登録処理中にエラーが発生しました' };
    } finally {
      setLoading(false);
    }
  };

  // セットアップ完了処理のモック実装
  const completeSetup = async (data) => {
    setLoading(true);
    try {
      const selectedCharacter = mockCharacters.find(c => c._id === data.characterId);
      if (!selectedCharacter) {
        return { success: false, error: '選択されたキャラクターが見つかりません' };
      }
      
      const updatedUser = {
        ...user,
        name: data.name,
        hasCompletedSetup: true,
        selectedCharacter
      };
      
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: 'セットアップ処理中にエラーが発生しました' };
    } finally {
      setLoading(false);
    }
  };

  // 言語設定更新のモック実装
  const updateLanguage = async (language) => {
    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        preferredLanguage: language
      };
      
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: '言語設定の更新中にエラーが発生しました' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <MockAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        completeSetup,
        updateLanguage
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

// モック認証フックを作成
export function useMockAuth() {
  return useContext(MockAuthContext);
}

// 実際のuseAuth関数の代わりに使用するモック版
export const useAuth = () => {
  // 初期値を設定
  const defaultContext = {
    user: mockUser,
    loading: false,
    login: async () => ({ success: true }),
    logout: async () => ({ success: true }),
    register: async () => ({ success: true }),
    completeSetup: async (data) => {
      const selectedCharacter = mockCharacters.find(c => c._id === data.characterId);
      return { 
        success: true, 
        user: {
          ...mockUser,
          name: data.name,
          hasCompletedSetup: true,
          selectedCharacter
        }
      };
    },
    updateLanguage: async (language) => ({
      success: true,
      user: {
        ...mockUser,
        preferredLanguage: language
      }
    })
  };
  
  return defaultContext;
};
