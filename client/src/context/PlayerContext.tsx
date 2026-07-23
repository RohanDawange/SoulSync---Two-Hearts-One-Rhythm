import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { Song, MusicSource } from '@/types/song';
import { useRoom } from './RoomContext';
import * as roomService from '@/services/roomService';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  source: MusicSource | null;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  changeSong: (song: Song) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (d: number) => void;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  source: MusicSource | null;
}

type PlayerAction =
  | { type: 'SET_SONG'; payload: Song | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_REPEAT'; payload: 'off' | 'all' | 'one' }
  | { type: 'SET_SOURCE'; payload: MusicSource | null }
  | { type: 'SYNC_FROM_ROOM'; payload: { currentSong: Song | null; isPlaying: boolean; timestamp: number } };

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_SONG':
      return { ...state, currentSong: action.payload, source: action.payload?.source || null };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)) };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'SET_REPEAT':
      return { ...state, repeat: action.payload };
    case 'SET_SOURCE':
      return { ...state, source: action.payload };
    case 'SYNC_FROM_ROOM':
      return {
        ...state,
        currentSong: action.payload.currentSong,
        isPlaying: action.payload.isPlaying,
        currentTime: action.payload.timestamp,
        source: action.payload.currentSong?.source || null,
      };
    default:
      return state;
  }
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.5,
    isMuted: false,
    shuffle: false,
    repeat: 'off',
    source: null,
  });
  const { currentRoom } = useRoom();

  useEffect(() => {
    if (!currentRoom) return;
    dispatch({
      type: 'SYNC_FROM_ROOM',
      payload: {
        currentSong: currentRoom.currentSong,
        isPlaying: currentRoom.isPlaying,
        timestamp: currentRoom.timestamp,
      },
    });
  }, [currentRoom?.currentSong, currentRoom?.isPlaying, currentRoom?.timestamp]);

  const play = useCallback(async () => {
    if (!currentRoom) return;
    dispatch({ type: 'SET_PLAYING', payload: true });
    await roomService.updatePlayerState(currentRoom.code, { isPlaying: true, timestamp: state.currentTime });
  }, [currentRoom, state.currentTime]);

  const pause = useCallback(async () => {
    if (!currentRoom) return;
    dispatch({ type: 'SET_PLAYING', payload: false });
    await roomService.updatePlayerState(currentRoom.code, { isPlaying: false, timestamp: state.currentTime });
  }, [currentRoom, state.currentTime]);

  const seek = useCallback(async (time: number) => {
    dispatch({ type: 'SET_TIME', payload: time });
    if (!currentRoom) return;
    await roomService.updatePlayerState(currentRoom.code, { timestamp: time });
  }, [currentRoom]);

  const setVolume = useCallback((v: number) => {
    dispatch({ type: 'SET_VOLUME', payload: v });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const next = useCallback(async () => {
    if (!currentRoom || !currentRoom.playlist.length) return;
    const idx = currentRoom.playlist.findIndex(s => s.id === state.currentSong?.id);
    const nextIdx = state.shuffle
      ? Math.floor(Math.random() * currentRoom.playlist.length)
      : (idx + 1) % currentRoom.playlist.length;
    const nextSong = currentRoom.playlist[nextIdx];
    if (nextSong) {
      await changeSongAction(nextSong);
    }
  }, [currentRoom, state.currentSong, state.shuffle]);

  const prev = useCallback(async () => {
    if (!currentRoom || !currentRoom.playlist.length) return;
    const idx = currentRoom.playlist.findIndex(s => s.id === state.currentSong?.id);
    const prevIdx = idx <= 0 ? currentRoom.playlist.length - 1 : idx - 1;
    const prevSong = currentRoom.playlist[prevIdx];
    if (prevSong) {
      await changeSongAction(prevSong);
    }
  }, [currentRoom, state.currentSong]);

  const changeSongAction = async (song: Song) => {
    if (!currentRoom) return;
    dispatch({ type: 'SET_SONG', payload: song });
    dispatch({ type: 'SET_PLAYING', payload: true });
    dispatch({ type: 'SET_TIME', payload: 0 });
    await roomService.updatePlayerState(currentRoom.code, {
      currentSong: song,
      isPlaying: true,
      timestamp: 0,
    });
  };

  const changeSong = useCallback(changeSongAction, [currentRoom]);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const toggleRepeat = useCallback(() => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const idx = modes.indexOf(state.repeat);
    const next = modes[(idx + 1) % modes.length];
    dispatch({ type: 'SET_REPEAT', payload: next });
  }, [state.repeat]);

  const setCurrentSong = useCallback((song: Song | null) => {
    dispatch({ type: 'SET_SONG', payload: song });
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: 'SET_TIME', payload: time });
  }, []);

  const setDuration = useCallback((d: number) => {
    dispatch({ type: 'SET_DURATION', payload: d });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong: state.currentSong,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime,
        duration: state.duration,
        volume: state.volume,
        isMuted: state.isMuted,
        shuffle: state.shuffle,
        repeat: state.repeat,
        source: state.source,
        play, pause, seek, setVolume, toggleMute, next, prev, changeSong,
        toggleShuffle, toggleRepeat, setCurrentSong, setIsPlaying, setCurrentTime, setDuration,
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
