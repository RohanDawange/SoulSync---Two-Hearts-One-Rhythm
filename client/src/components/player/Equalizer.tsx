import { motion } from 'framer-motion';

interface EqualizerProps {
  isPlaying: boolean;
  bars?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-3 gap-px',
  md: 'h-5 gap-0.5',
  lg: 'h-8 gap-1',
};

const barSizes = {
  sm: 'w-[3px]',
  md: 'w-[5px]',
  lg: 'w-2',
};

export default function Equalizer({ isPlaying, bars = 5, color = 'bg-primary-400', size = 'md' }: EqualizerProps) {
  return (
    <div className={`flex items-center ${sizeMap[size]}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={`${barSizes[size]} rounded-full ${color}`}
          animate={
            isPlaying
              ? {
                  height: ['20%', '80%', '50%', '90%', '30%', '70%', '20%'],
                  transition: {
                    duration: 0.6 + i * 0.1,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  },
                }
              : { height: '30%' }
          }
          style={{ height: '30%' }}
        />
      ))}
    </div>
  );
}
