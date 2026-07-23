import { useEffect, useRef, useCallback } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function YouTubeEmbed({
  videoId, isPlaying, currentTime, onReady, onStateChange, onTimeUpdate, onEnded,
}: YouTubeEmbedProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiReady = useRef(false);
  const playerReady = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevIsPlaying = useRef(isPlaying);
  const prevCurrentTime = useRef(currentTime);

  const handleStateChange = useCallback((event: any) => {
    onStateChange?.(event.data);
    if (event.data === window.YT.PlayerState.ENDED) {
      onEnded?.();
    }
  }, [onStateChange, onEnded]);

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (!containerRef.current || !window.YT) return;
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            playerReady.current = true;
            onReady?.();
          },
          onStateChange: handleStateChange,
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);

      window.onYouTubeIframeAPIReady = () => {
        apiReady.current = true;
        initPlayer();
      };
    } else if (window.YT && window.YT.loaded) {
      apiReady.current = true;
      initPlayer();
    } else {
      const check = setInterval(() => {
        if (window.YT && window.YT.loaded) {
          clearInterval(check);
          apiReady.current = true;
          initPlayer();
        }
      }, 100);
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
        playerReady.current = false;
      }
    };
  }, [videoId, onReady, handleStateChange]);

  useEffect(() => {
    if (!playerReady.current || !playerRef.current) return;

    if (isPlaying && !prevIsPlaying.current) {
      playerRef.current.playVideo();
    } else if (!isPlaying && prevIsPlaying.current) {
      playerRef.current.pauseVideo();
    }
    prevIsPlaying.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!playerReady.current || !playerRef.current) return;
    const diff = Math.abs(currentTime - prevCurrentTime.current);
    if (diff > 1.5) {
      playerRef.current.seekTo(currentTime, true);
    }
    prevCurrentTime.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (!onTimeUpdate) return;

    if (isPlaying) {
      pollRef.current = setInterval(() => {
        if (playerRef.current && playerReady.current) {
          try {
            const t = playerRef.current.getCurrentTime();
            onTimeUpdate(t);
          } catch {}
        }
      }, 250);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isPlaying, onTimeUpdate]);

  return (
    <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true">
      <div ref={containerRef} />
    </div>
  );
}
