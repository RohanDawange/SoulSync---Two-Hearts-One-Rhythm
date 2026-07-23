import { useRef, useCallback } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  showValue?: boolean;
}

export default function Slider({ value, onChange, min, max, step = 1, label, showValue }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  const handleMouseDown = (e: React.MouseEvent) => {
    updateValue(e.clientX);
    const handleMouseMove = (ev: MouseEvent) => updateValue(ev.clientX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const updateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, stepped)));
  };

  const percent = getPercent();

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showValue && <span className="text-xs text-gray-400">{value}</span>}
        </div>
      )}
      <div
        ref={trackRef}
        className="relative h-2 w-full rounded-full bg-white/10 cursor-pointer group"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
    </div>
  );
}
