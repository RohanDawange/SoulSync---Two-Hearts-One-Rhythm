import { useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';

export function useMediaSession() {
  const { currentSong, isPlaying, play, pause, next, prev, seek, setCurrentTime, currentTime } = usePlayer();

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: '',
        artwork: currentSong.albumArt
          ? [{ src: currentSong.albumArt, sizes: '512x512', type: 'image/png' }]
          : [],
      });
    } else {
      navigator.mediaSession.metadata = null;
    }
  }, [currentSong]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['nexttrack', () => next()],
      ['previoustrack', () => prev()],
      ['seekforward', () => seek(Math.min(currentTime + 10, currentSong?.duration || 0))],
      ['seekbackward', () => seek(Math.max(currentTime - 10, 0))],
      ['seekto', (details) => {
        if (details.fastSeek !== undefined && details.seekTime !== undefined) {
          setCurrentTime(details.seekTime);
        }
      }],
    ];

    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Action not supported by browser
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Action not supported by browser
        }
      }
    };
  }, [play, pause, next, prev, seek, currentTime, currentSong]);
}
