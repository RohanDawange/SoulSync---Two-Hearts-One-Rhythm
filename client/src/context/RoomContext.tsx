import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { Room } from '@/types/room';
import { useAuth } from './AuthContext';
import * as roomService from '@/services/roomService';
import * as presenceService from '@/services/presenceService';
import toast from 'react-hot-toast';

interface RoomContextType {
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  copyInviteLink: () => void;
  copyRoomCode: () => void;
}

interface RoomState {
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
}

type RoomAction =
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_ROOM'; payload: Partial<Room> }
  | { type: 'CLEAR_ROOM' };

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'SET_ROOM':
      return { currentRoom: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_ROOM':
      return {
        ...state,
        currentRoom: state.currentRoom ? { ...state.currentRoom, ...action.payload } : null,
      };
    case 'CLEAR_ROOM':
      return { currentRoom: null, isLoading: false, error: null };
    default:
      return state;
  }
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, {
    currentRoom: null,
    isLoading: false,
    error: null,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.currentRoom) return;
    const unsub = roomService.listenRoom(user.currentRoom, (room) => {
      if (room) {
        dispatch({ type: 'SET_ROOM', payload: room });
      } else {
        dispatch({ type: 'CLEAR_ROOM' });
      }
    });
    return unsub;
  }, [user?.currentRoom]);

  useEffect(() => {
    if (!user) return;
    presenceService.setUserOnline(user.uid, true);
    return presenceService.setupPresenceCleanup(user.uid);
  }, [user]);

  const createRoom = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const room = await roomService.createRoom(user);
      dispatch({ type: 'SET_ROOM', payload: room });
      toast.success('Room created!');
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  }, [user]);

  const joinRoom = useCallback(async (code: string) => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const room = await roomService.joinRoom(code.toUpperCase(), user);
      dispatch({ type: 'SET_ROOM', payload: room });
      toast.success(`Joined room ${room.code}`);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  }, [user]);

  const leaveRoom = useCallback(async () => {
    if (!user || !state.currentRoom) return;
    try {
      await roomService.leaveRoom(state.currentRoom.code, user.uid);
      dispatch({ type: 'CLEAR_ROOM' });
      toast('You left the room', { icon: '👋' });
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [user, state.currentRoom]);

  const copyInviteLink = useCallback(() => {
    if (!state.currentRoom) return;
    const link = `${window.location.origin}/#/room/${state.currentRoom.code}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Invite link copied!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  }, [state.currentRoom]);

  const copyRoomCode = useCallback(() => {
    if (!state.currentRoom) return;
    navigator.clipboard.writeText(state.currentRoom.code).then(() => {
      toast.success('Room code copied!');
    }).catch(() => {
      toast.error('Failed to copy room code');
    });
  }, [state.currentRoom]);

  return (
    <RoomContext.Provider
      value={{
        currentRoom: state.currentRoom,
        isLoading: state.isLoading,
        error: state.error,
        createRoom,
        joinRoom,
        leaveRoom,
        copyInviteLink,
        copyRoomCode,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
}
