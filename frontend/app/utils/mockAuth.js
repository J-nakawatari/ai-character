import { useState, useEffect, createContext, useContext } from 'react';
import { mockUser, mockCharacters } from './mockData';

const MockAuthContext = createContext();

export function MockAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500); // 読み込み中の状態を再現するために少し遅延させる
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
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

export function useMockAuth() {
  return useContext(MockAuthContext);
}

export function useAuth() {
  return useMockAuth();
}
