'use client';

import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatContextProvider({ children }) {
  const [chatInfo, setChatInfo] = useState({
    tokenBalance: undefined,
    remainingFreeChats: null,
    isBaseCharacter: false,
    affinityData: null
  });

  const updateChatInfo = (info) => {
    setChatInfo(prev => ({ ...prev, ...info }));
  };

  return (
    <ChatContext.Provider value={{ chatInfo, updateChatInfo }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    return {
      chatInfo: { tokenBalance: undefined, remainingFreeChats: null, isBaseCharacter: false, affinityData: null },
      updateChatInfo: () => {}
    };
  }
  return context;
}