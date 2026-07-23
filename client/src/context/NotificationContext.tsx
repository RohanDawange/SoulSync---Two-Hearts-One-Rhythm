import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { SOCKET_EVENTS } from '@/utils/constants';
import { useSocket } from './SocketContext';
import { useRoom } from './RoomContext';

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { currentRoom } = useRoom();

  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data: { displayName: string }) => {
      toast.success(`${data.displayName} joined the room`, { id: 'participant-joined' });
    };

    const handleParticipantLeft = (data: { displayName: string }) => {
      toast(`${data.displayName} left the room`, { id: 'participant-left', icon: '👋' });
    };

    const handleStateChange = (data: { song: { title: string; artist: string } }) => {
      if (data.song) {
        toast(`Now playing: ${data.song.title} - ${data.song.artist}`, {
          id: 'song-changed',
          icon: '🎵',
          duration: 3000,
        });
      }
    };

    const handleMessage = (data: { senderName: string }) => {
      if (data.senderName) {
        toast(`New message from ${data.senderName}`, {
          id: 'new-message',
          icon: '💬',
          duration: 2000,
        });
      }
    };

    socket.on(SOCKET_EVENTS.ROOM_PARTICIPANT_JOINED, handleParticipantJoined);
    socket.on(SOCKET_EVENTS.ROOM_PARTICIPANT_LEFT, handleParticipantLeft);
    socket.on(SOCKET_EVENTS.PLAYER_STATE_CHANGE, handleStateChange);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_PARTICIPANT_JOINED, handleParticipantJoined);
      socket.off(SOCKET_EVENTS.ROOM_PARTICIPANT_LEFT, handleParticipantLeft);
      socket.off(SOCKET_EVENTS.PLAYER_STATE_CHANGE, handleStateChange);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
    };
  }, [socket, currentRoom]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast(message, { icon: 'ℹ️' });
        break;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
