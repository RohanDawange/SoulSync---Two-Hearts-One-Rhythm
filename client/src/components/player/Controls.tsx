import { motion } from 'framer-motion';
import { IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack, IoShuffle, IoRepeat } from 'react-icons/io5';

interface ControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  shuffle: boolean;
  repeat: boolean;
}

export default function Controls({
  isPlaying, onPlay, onPause, onNext, onPrev, onShuffle, onRepeat, shuffle, repeat,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onShuffle}
        className={`p-2 rounded-full transition-colors ${shuffle ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
        title="Shuffle"
      >
        <IoShuffle size={18} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onPrev}
        className="p-2 text-gray-300 hover:text-white transition-colors"
        title="Previous"
      >
        <IoPlaySkipBack size={22} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={isPlaying ? onPause : onPlay}
        className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-shadow"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <IoPause size={24} /> : <IoPlay size={24} className="ml-0.5" />}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onNext}
        className="p-2 text-gray-300 hover:text-white transition-colors"
        title="Next"
      >
        <IoPlaySkipForward size={22} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onRepeat}
        className={`p-2 rounded-full transition-colors ${repeat ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
        title="Repeat"
      >
        <IoRepeat size={18} />
      </motion.button>
    </div>
  );
}
