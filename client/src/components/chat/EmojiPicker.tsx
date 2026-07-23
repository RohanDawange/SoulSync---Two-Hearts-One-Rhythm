import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  {
    name: 'Smileys',
    emojis: ['😊', '😍', '🥰', '😘', '😁', '😂', '🤣', '😅', '🥺', '😌', '😇', '🙂', '😉', '🤗', '😎', '🤩'],
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💗', '💖', '💘', '💝', '❣️', '💓', '🩷'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👊', '✊', '🤞', '✌️', '🤟', '👌', '🤝', '🙏', '💪', '👏', '🙌', '🎉', '✨', '💫'],
  },
  {
    name: 'Music',
    emojis: ['🎵', '🎶', '🎤', '🎧', '🎼', '🎹', '🎸', '🥁', '🎷', '🎺', '🎻', '🎙️', '📻', '🎛️', '🎚️', '🎵'],
  },
  {
    name: 'Romantic',
    emojis: ['💋', '💌', '🌹', '🥀', '💐', '🌸', '🌺', '🌷', '🕊️', '💑', '👩‍❤️‍👨', '💏', '💍', '🎀', '🎁', '🩷'],
  },
];

const RECENT_KEY = 'soulsync-recent-emojis';
const MAX_RECENT = 12;

function loadRecent(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecent(emojis: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(emojis.slice(0, MAX_RECENT)));
  } catch {}
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [activeCategory, setActiveCategory] = useState(recent.length > 0 ? 0 : 1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = useCallback(
    (emoji: string) => {
      const updated = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, MAX_RECENT);
      setRecent(updated);
      saveRecent(updated);
      onSelect(emoji);
    },
    [recent, onSelect]
  );

  const categories = recent.length > 0
    ? [{ name: 'Recent', emojis: recent }, ...EMOJI_CATEGORIES]
    : EMOJI_CATEGORIES;

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
        <div className="flex gap-1 p-2 overflow-x-auto border-b border-white/10 scrollbar-thin">
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`shrink-0 px-3 py-1.5 text-xs rounded-lg transition-all ${
                activeCategory === i
                  ? 'bg-purple-600/40 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="p-3 max-h-52 overflow-y-auto grid grid-cols-8 gap-1 scrollbar-thin">
          {categories[activeCategory]?.emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className="text-xl p-1.5 hover:bg-white/10 rounded-lg transition-colors hover:scale-110 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
