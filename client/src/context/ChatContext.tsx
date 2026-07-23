import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef, ReactNode } from 'react';
import { Message } from '@/types/message';
import { useRoom } from './RoomContext';
import { useAuth } from './AuthContext';
import * as chatService from '@/services/chatService';

interface ChatContextType {
  messages: Message[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: string | null;
  sendMessage: (content: string, type?: 'text' | 'image' | 'gif') => Promise<void>;
  setTyping: (isTyping: boolean) => void;
}

interface ChatState {
  messages: Message[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: string | null;
}

type ChatAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: { isTyping: boolean; user: string | null } }
  | { type: 'RESET_UNREAD' }
  | { type: 'CLEAR_CHAT' };

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((s: ChatState, a: ChatAction): ChatState => {
    switch (a.type) {
      case 'SET_MESSAGES':
        return { ...s, messages: a.payload };
      case 'ADD_MESSAGE':
        return { ...s, messages: [...s.messages, a.payload], unreadCount: s.unreadCount + 1 };
      case 'SET_TYPING':
        return { ...s, isTyping: a.payload.isTyping, typingUser: a.payload.user };
      case 'RESET_UNREAD':
        return { ...s, unreadCount: 0 };
      case 'CLEAR_CHAT':
        return { messages: [], unreadCount: 0, isTyping: false, typingUser: null };
      default:
        return s;
    }
  }, { messages: [], unreadCount: 0, isTyping: false, typingUser: null });

  const { currentRoom } = useRoom();
  const { user } = useAuth();
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!currentRoom) {
      dispatch({ type: 'CLEAR_CHAT' });
      return;
    }
    const unsub = chatService.listenMessages(currentRoom.code, (msgs) => {
      dispatch({ type: 'SET_MESSAGES', payload: msgs });
    });
    return unsub;
  }, [currentRoom?.code]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'gif' = 'text') => {
    if (!currentRoom || !user || !content.trim()) return;
    await chatService.sendMessage(currentRoom.code, {
      senderId: user.uid,
      senderName: user.displayName,
      senderAvatar: user.photoURL,
      content: content.trim(),
      type,
    });
  }, [currentRoom, user]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!currentRoom || !user) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (isTyping) {
      dispatch({ type: 'SET_TYPING', payload: { isTyping: true, user: 'Partner' } });
      typingTimer.current = setTimeout(() => {
        dispatch({ type: 'SET_TYPING', payload: { isTyping: false, user: null } });
      }, 2000);
    }
  }, [currentRoom, user]);

  return (
    <ChatContext.Provider
      value={{
        messages: state.messages,
        unreadCount: state.unreadCount,
        isTyping: state.isTyping,
        typingUser: state.typingUser,
        sendMessage,
        setTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
