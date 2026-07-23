import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaSpinner } from 'react-icons/fa';

interface GIFPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const TRENDING_GIFS = [
  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  'https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif',
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
  'https://media.giphy.com/media/l0K4mbH4lKBhAPFuM/giphy.gif',
  'https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif',
  'https://media.giphy.com/media/26gsjCZp3PrvcFiLe/giphy.gif',
  'https://media.giphy.com/media/3oz8xRipFg5T9ks1yE/giphy.gif',
  'https://media.giphy.com/media/l2Je66zG6mAAZxgqI/giphy.gif',
  'https://media.giphy.com/media/3o7abldj0b3rxrZUxw/giphy.gif',
  'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
  'https://media.giphy.com/media/3o7TKzolvxT2M2nDM0/giphy.gif',
];

const SEARCH_TERM_MAP: Record<string, string[]> = {
  love: ['https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'],
  kiss: ['https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif', 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif'],
  hug: ['https://media.giphy.com/media/l0K4mbH4lKBhAPFuM/giphy.gif', 'https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif'],
  dance: ['https://media.giphy.com/media/26gsjCZp3PrvcFiLe/giphy.gif', 'https://media.giphy.com/media/3oz8xRipFg5T9ks1yE/giphy.gif'],
  music: ['https://media.giphy.com/media/l2Je66zG6mAAZxgqI/giphy.gif', 'https://media.giphy.com/media/3o7abldj0b3rxrZUxw/giphy.gif'],
  celebrate: ['https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif', 'https://media.giphy.com/media/3o7TKzolvxT2M2nDM0/giphy.gif'],
};

export default function GIFPicker({ onSelect, onClose }: GIFPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<string[]>(TRENDING_GIFS);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setGifs(TRENDING_GIFS);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      const lower = query.toLowerCase();
      const results = Object.entries(SEARCH_TERM_MAP).reduce((acc: string[], [key, urls]) => {
        if (key.includes(lower) || lower.includes(key)) acc.push(...urls);
        return acc;
      }, []);
      setGifs(results.length > 0 ? results : TRENDING_GIFS.slice(0, 6));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden mx-3 mb-2"
      >
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GIFs..."
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10"
            />
          </div>
        </div>
        <div className="p-3 max-h-56 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-purple-400" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif}
                  onClick={() => onSelect(gif)}
                  className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer"
                >
                  <img
                    src={gif}
                    alt="GIF"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
