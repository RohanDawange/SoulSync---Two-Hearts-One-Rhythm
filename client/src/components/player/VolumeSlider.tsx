import { useRef, useCallback, useState } from 'react';
import { IoVolumeHigh, IoVolumeMedium, IoVolumeLow, IoVolumeMute } from 'react-icons/io5';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted: boolean;
  onMuteToggle: () => void;
  variant?: 'horizontal' | 'vertical';
}

export default function VolumeSlider({ volume, onVolumeChange, muted, onMuteToggle, variant = 'horizontal' }: VolumeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isDragging = useRef(false);

  const effectiveVolume = muted ? 0 : volume;
  const percent = effectiveVolume * 100;

  const getVolumeIcon = () => {
    if (muted || volume === 0) return IoVolumeMute;
    if (volume < 0.3) return IoVolumeLow;
    if (volume < 0.7) return IoVolumeMedium;
    return IoVolumeHigh;
  };

  const Icon = getVolumeIcon();

  const updateValue = useCallback((clientX: number, clientY?: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let ratio: number;

    if (variant === 'vertical') {
      const y = Math.max(0, Math.min(clientY! - rect.top, rect.height));
      ratio = 1 - y / rect.height;
    } else {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      ratio = x / rect.width;
    }

    onVolumeChange(Math.max(0, Math.min(1, ratio)));
  }, [onVolumeChange, variant]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    updateValue(e.clientX, e.clientY);

    const handleMouseMove = (ev: MouseEvent) => {
      if (isDragging.current) updateValue(ev.clientX, ev.clientY);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateValue]);

  return (
    <div
      className="flex items-center gap-2 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={onMuteToggle}
        className="text-gray-400 hover:text-white transition-colors p-1"
        title={muted ? 'Unmute' : 'Mute'}
      >
        <Icon size={18} />
      </button>

      <div
        className={`relative ${variant === 'vertical' ? 'w-1.5 h-24' : 'w-24 h-1.5'} rounded-full bg-white/10 cursor-pointer ${variant === 'vertical' ? 'hidden group-hover:flex' : ''}`}
        style={variant === 'vertical' ? { display: isHovering ? 'flex' : 'none' } : undefined}
        ref={trackRef}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`absolute ${variant === 'vertical' ? 'bottom-0 left-0 w-full' : 'left-0 top-0 h-full'} rounded-full bg-gradient-to-r from-primary-500 to-accent-500`}
          style={variant === 'vertical' ? { height: `${percent}%` } : { width: `${percent}%` }}
        />
        <div
          className={`absolute ${variant === 'vertical' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
          style={variant === 'vertical' ? { bottom: `calc(${percent}% - 6px)` } : { left: `calc(${percent}% - 6px)` }}
        />
      </div>
    </div>
  );
}
