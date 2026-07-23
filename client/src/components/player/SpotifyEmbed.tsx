import { useEffect, useRef } from 'react';

interface SpotifyEmbedProps {
  trackId: string;
  isPlaying: boolean;
  onReady?: () => void;
}

export default function SpotifyEmbed({ trackId, isPlaying, onReady }: SpotifyEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevIsPlaying = useRef(isPlaying);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      onReady?.();
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [onReady, trackId]);

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const message = isPlaying
      ? JSON.stringify({ command: 'play', type: 'playback' })
      : JSON.stringify({ command: 'pause', type: 'playback' });

    iframeRef.current.contentWindow.postMessage(message, '*');
    prevIsPlaying.current = isPlaying;
  }, [isPlaying]);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
      <iframe
        ref={iframeRef}
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        allow="encrypted-media; autoplay"
        className="border-0"
        title="Spotify Player"
      />
    </div>
  );
}
