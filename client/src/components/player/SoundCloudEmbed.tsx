import { useEffect, useRef, useCallback } from 'react';

interface SoundCloudEmbedProps {
  trackId: string;
  isPlaying: boolean;
  currentTime: number;
  onReady?: () => void;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

declare global {
  interface Window {
    SC: any;
  }
}

export default function SoundCloudEmbed({
  trackId, isPlaying, currentTime, onReady, onTimeUpdate, onEnded,
}: SoundCloudEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  const readyRef = useRef(false);
  const prevIsPlaying = useRef(isPlaying);
  const prevCurrentTime = useRef(currentTime);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!trackId || !iframeRef.current) return;

    const loadWidget = () => {
      if (!iframeRef.current || !window.SC) return;

      widgetRef.current = window.SC.Widget(iframeRef.current);

      widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
        readyRef.current = true;
        onReady?.();
      });

      widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
        finishedRef.current = false;
      });

      widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
        finishedRef.current = true;
        onEnded?.();
      });
    };

    if (!window.SC) {
      const tag = document.createElement('script');
      tag.src = 'https://w.soundcloud.com/player/api.js';
      tag.async = true;
      tag.onload = loadWidget;
      document.body.appendChild(tag);
    } else {
      loadWidget();
    }

    return () => {
      readyRef.current = false;
      widgetRef.current = null;
    };
  }, [trackId, onReady, onEnded]);

  useEffect(() => {
    if (!readyRef.current || !widgetRef.current) return;

    if (isPlaying && !prevIsPlaying.current) {
      widgetRef.current.play();
    } else if (!isPlaying && prevIsPlaying.current) {
      widgetRef.current.pause();
    }
    prevIsPlaying.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!readyRef.current || !widgetRef.current) return;
    const diff = Math.abs(currentTime - prevCurrentTime.current);
    if (diff > 1.5) {
      widgetRef.current.seekTo(currentTime * 1000);
    }
    prevCurrentTime.current = currentTime;
  }, [currentTime]);

  const pollTime = useCallback(() => {
    if (!widgetRef.current || !readyRef.current) return;
    widgetRef.current.getPosition((position: number) => {
      onTimeUpdate?.(position / 1000);
    });
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!isPlaying || !onTimeUpdate) return;

    pollRef.current = setInterval(pollTime, 250);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isPlaying, onTimeUpdate, pollTime]);

  return (
    <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true">
      <iframe
        ref={iframeRef}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(trackId)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
        width="100%"
        height="166"
        title="SoundCloud Player"
      />
    </div>
  );
}
