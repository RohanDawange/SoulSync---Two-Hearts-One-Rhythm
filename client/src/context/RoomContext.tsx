import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { Room } from '@/types/room';
import { SOCKET_EVENTS } from '@/utils/constants';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getSocket } from '@/socket';
import toast from 'react-hot-toast';

interface RoomContextType {
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
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
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
      toast.success(`Joined room ${room.code}`);
    };

    const handleParticipantJoined = (data: { displayName: string }) => {
      if (data.displayName !== user?.displayName) {
        toast.success(`${data.displayName} joined the room`);
      }
    };

    const handleParticipantLeft = (data: { displayName: string }) => {
      toast(`${data.displayName} left the room`, { icon: '👋' });
    };

    const handleRoomError = (data: { message: string }) => {
      dispatch({ type: 'SET_ERROR', payload: data.message });
      toast.error(data.message);
    };

    const handleRoomLeft = () => {
      dispatch({ type: 'CLEAR_ROOM' });
      toast('You left the room', { icon: '👋' });
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_PARTICIPANT_JOINED, handleParticipantJoined);
    socket.on(SOCKET_EVENTS.ROOM_PARTICIPANT_LEFT, handleParticipantLeft);
    socket.on(SOCKET_EVENTS.ROOM_ERROR, handleRoomError);
    socket.on(SOCKET_EVENTS.ROOM_LEFT, handleRoomLeft);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_PARTICIPANT_JOINED, handleParticipantJoined);
      socket.off(SOCKET_EVENTS.ROOM_PARTICIPANT_LEFT, handleParticipantLeft);
      socket.off(SOCKET_EVENTS.ROOM_ERROR, handleRoomError);
      socket.off(SOCKET_EVENTS.ROOM_LEFT, handleRoomLeft);
    };
  }, [socket, user?.displayName]);

  const createRoom = useCallback(() => {
    const s = socket || getSocket();
    if (!s) {
      toast.error('Not connected');
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    s.emit(SOCKET_EVENTS.ROOM_CREATE, (response: { room: Room; error?: string }) => {
      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        toast.error(response.error);
      } else {
        dispatch({ type: 'SET_ROOM', payload: response.room });
        toast.success('Room created!');
      }
    });
  }, [socket]);

  const joinRoom = useCallback((code: string) => {
    const s = socket || getSocket();
    if (!s) {
      toast.error('Not connected');
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    s.emit(SOCKET_EVENTS.ROOM_JOIN, { roomCode: code });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    const s = socket || getSocket();
    if (!s || !state.currentRoom) return;
    s.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomCode: state.currentRoom.code });
  }, [socket, state.currentRoom]);

  const copyInviteLink = useCallback(() => {
    if (!state.currentRoom) return;
    const link = `${window.location.origin}/room/${state.currentRoom.code}`;
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
