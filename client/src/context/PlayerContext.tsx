import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { Song, MusicSource } from '@/types/song';
import { SOCKET_EVENTS } from '@/utils/constants';
import { useSocket } from './SocketContext';
import { useRoom } from './RoomContext';
import { getSocket } from '@/socket';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: boolean;
  source: MusicSource | null;
}

interface PlayerContextType extends PlayerState {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  changeSong: (song: Song) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
}

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  shuffle: false,
  repeat: false,
  source: null,
};

type PlayerAction =
  | { type: 'SET_SONG'; payload: Song | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_SOURCE'; payload: MusicSource | null }
  | { type: 'RESET' };

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_SONG':
      return { ...state, currentSong: action.payload, currentTime: 0, duration: action.payload?.duration || 0, source: action.payload?.source || null };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)), isMuted: false };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'TOGGLE_REPEAT':
      return { ...state, repeat: !state.repeat };
    case 'SET_SOURCE':
      return { ...state, source: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const { socket } = useSocket();
  const { currentRoom } = useRoom();

  useEffect(() => {
    if (!socket) return;

    const handleStateChange = (data: { song: Song; isPlaying: boolean; timestamp: number }) => {
      dispatch({ type: 'SET_SONG', payload: data.song });
      dispatch({ type: 'SET_PLAYING', payload: data.isPlaying });
      dispatch({ type: 'SET_CURRENT_TIME', payload: data.timestamp });
    };

    const handleTimestamp = (data: { timestamp: number }) => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: data.timestamp });
    };

    const handleUrlChange = (data: { song: Song }) => {
      dispatch({ type: 'SET_SONG', payload: data.song });
    };

    socket.on(SOCKET_EVENTS.PLAYER_STATE_CHANGE, handleStateChange);
    socket.on(SOCKET_EVENTS.PLAYER_TIMESTAMP, handleTimestamp);
    socket.on(SOCKET_EVENTS.PLAYER_URL_CHANGE, handleUrlChange);

    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_STATE_CHANGE, handleStateChange);
      socket.off(SOCKET_EVENTS.PLAYER_TIMESTAMP, handleTimestamp);
      socket.off(SOCKET_EVENTS.PLAYER_URL_CHANGE, handleUrlChange);
    };
  }, [socket]);

  const emitIfInRoom = useCallback((event: string, data?: any) => {
    const s = socket || getSocket();
    if (!s || !currentRoom) return;
    s.emit(event, { roomCode: currentRoom.code, ...data });
  }, [socket, currentRoom]);

  const play = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', payload: true });
    emitIfInRoom(SOCKET_EVENTS.PLAYER_PLAY);
  }, [emitIfInRoom]);

  const pause = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', payload: false });
    emitIfInRoom(SOCKET_EVENTS.PLAYER_PAUSE);
  }, [emitIfInRoom]);

  const seek = useCallback((time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    emitIfInRoom(SOCKET_EVENTS.PLAYER_SEEK, { timestamp: time });
  }, [emitIfInRoom]);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const next = useCallback(() => {
    emitIfInRoom(SOCKET_EVENTS.PLAYER_NEXT);
  }, [emitIfInRoom]);

  const prev = useCallback(() => {
    emitIfInRoom(SOCKET_EVENTS.PLAYER_PREV);
  }, [emitIfInRoom]);

  const changeSong = useCallback((song: Song) => {
    dispatch({ type: 'SET_SONG', payload: song });
    const s = socket || getSocket();
    if (currentRoom && s) {
      s.emit(SOCKET_EVENTS.PLAYER_URL_CHANGE, { roomCode: currentRoom.code, song });
    }
  }, [socket, currentRoom]);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const toggleRepeat = useCallback(() => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  }, []);

  const setCurrentSong = useCallback((song: Song | null) => {
    dispatch({ type: 'SET_SONG', payload: song });
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        seek,
        setVolume,
        toggleMute,
        next,
        prev,
        changeSong,
        toggleShuffle,
        toggleRepeat,
        setCurrentSong,
        setIsPlaying,
        setCurrentTime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
