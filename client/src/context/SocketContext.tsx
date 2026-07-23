import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from '@/socket';
import { useAuth } from './AuthContext';
import { getCurrentUser } from '@/firebase/auth';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  socketId: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const current = getSocket();
    if (current) {
      setSocket(current);
      setConnected(current.connected);
      setSocketId(current.id || null);
    }
  }, []);

  useEffect(() => {
    const s = getSocket();

    if (!s) {
      if (!user) return;
      return;
    }

    const handleConnect = () => {
      setConnected(true);
      setSocketId(s.id || null);
      setSocket(s);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setSocketId(null);
    };

    const handleConnectError = () => {
      setConnected(false);
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleConnectError);

    if (s.connected) {
      setConnected(true);
      setSocketId(s.id || null);
      setSocket(s);
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('connect_error', handleConnectError);
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const onReconnectAttempt = () => {
      toast.loading('Reconnecting...', { id: 'socket-reconnect' });
    };

    const onReconnect = () => {
      toast.success('Reconnected!', { id: 'socket-reconnect' });
    };

    const onReconnectError = () => {
      toast.error('Reconnection failed', { id: 'socket-reconnect' });
    };

    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect', onReconnect);
    socket.io.on('reconnect_error', onReconnectError);

    return () => {
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect', onReconnect);
      socket.io.off('reconnect_error', onReconnectError);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
