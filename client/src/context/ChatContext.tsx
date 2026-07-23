import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef, ReactNode } from 'react';
import { Message } from '@/types/message';
import { SOCKET_EVENTS } from '@/utils/constants';
import { useSocket } from './SocketContext';
import { useRoom } from './RoomContext';
import { getSocket } from '@/socket';

interface ChatContextType {
  messages: Message[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: string | null;
  sendMessage: (content: string, type?: Message['type']) => void;
  setTyping: (typing: boolean) => void;
  resetUnreadCount: () => void;
}

interface ChatState {
  messages: Message[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: string | null;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: { isTyping: boolean; userName: string | null } }
  | { type: 'RESET_UNREAD' }
  | { type: 'CLEAR_CHAT' };

const initialState: ChatState = {
  messages: [],
  unreadCount: 0,
  isTyping: false,
  typingUser: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        unreadCount: state.unreadCount + 1,
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload.isTyping,
        typingUser: action.payload.userName,
      };
    case 'RESET_UNREAD':
      return { ...state, unreadCount: 0 };
    case 'CLEAR_CHAT':
      return initialState;
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket } = useSocket();
  const { currentRoom } = useRoom();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    };

    const handleTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
      dispatch({ type: 'SET_TYPING', payload: { isTyping: data.isTyping, userName: data.userName } });
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
    socket.on(SOCKET_EVENTS.CHAT_TYPING, handleTyping);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
      socket.off(SOCKET_EVENTS.CHAT_TYPING, handleTyping);
    };
  }, [socket]);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text') => {
    const s = socket || getSocket();
    if (!s || !currentRoom) return;
    s.emit(SOCKET_EVENTS.CHAT_SEND, { roomCode: currentRoom.code, content, type });
  }, [socket, currentRoom]);

  const setTyping = useCallback((typing: boolean) => {
    const s = socket || getSocket();
    if (!s || !currentRoom) return;

    s.emit(SOCKET_EVENTS.CHAT_TYPING, { roomCode: currentRoom.code, isTyping: typing });

    if (typing) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        s.emit(SOCKET_EVENTS.CHAT_TYPING, { roomCode: currentRoom.code, isTyping: false });
      }, 2000);
    }
  }, [socket, currentRoom]);

  const resetUnreadCount = useCallback(() => {
    dispatch({ type: 'RESET_UNREAD' });
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages: state.messages,
        unreadCount: state.unreadCount,
        isTyping: state.isTyping,
        typingUser: state.typingUser,
        sendMessage,
        setTyping,
        resetUnreadCount,
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
