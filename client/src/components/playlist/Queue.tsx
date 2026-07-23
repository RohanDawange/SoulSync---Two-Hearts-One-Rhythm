import { motion, AnimatePresence } from 'framer-motion';
import { IoPlay, IoClose, IoMusicalNote } from 'react-icons/io5';
import { Song } from '@/types';
import { formatTime } from '@/utils';
import Button from '@/components/ui/Button';

interface QueueProps {
  queue: Song[];
  onRemoveFromQueue: (songId: string) => void;
  onPlayNow: (song: Song) => void;
  onClearQueue: () => void;
}

export default function Queue({ queue, onRemoveFromQueue, onPlayNow, onClearQueue }: QueueProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          Up Next
          {queue.length > 0 && (
            <span className="text-gray-500 font-normal normal-case text-xs">({queue.length})</span>
          )}
        </h3>
        {queue.length > 0 && (
          <button
            onClick={onClearQueue}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <IoMusicalNote size={18} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">Queue is empty</p>
          </div>
        ) : (
          <AnimatePresence>
            {queue.map((song, index) => (
              <motion.div
                key={song.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
              >
                <span className="text-xs text-gray-500 tabular-nums w-4">{index + 1}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>

                <span className="text-xs text-gray-500 tabular-nums">{formatTime(song.duration)}</span>

                <button
                  onClick={() => onPlayNow(song)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Play now"
                >
                  <IoPlay size={12} />
                </button>

                <button
                  onClick={() => onRemoveFromQueue(song.id)}
                  className="p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <IoClose size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
