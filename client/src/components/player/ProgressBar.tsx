import { useRef, useCallback } from 'react';
import { formatTime } from '@/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
}

export default function ProgressBar({ currentTime, duration, onSeek, onSeekStart, onSeekEnd }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const updateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  }, [duration, onSeek]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    onSeekStart?.();
    updateValue(e.clientX);

    const handleMouseMove = (ev: MouseEvent) => {
      if (isDragging.current) updateValue(ev.clientX);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        onSeekEnd?.();
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onSeekEnd, onSeekStart, updateValue]);

  return (
    <div className="w-full flex items-center gap-3">
      <span className="text-xs text-gray-400 font-mono min-w-[4ch] text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div
        ref={trackRef}
        className="relative flex-1 h-1.5 rounded-full bg-white/10 cursor-pointer group"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
          style={{ width: `${percent}%`, transition: isDragging.current ? 'none' : 'width 0.1s linear' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      </div>

      <span className="text-xs text-gray-400 font-mono min-w-[4ch] tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}
