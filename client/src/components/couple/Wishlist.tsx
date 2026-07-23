import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaHeart } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface WishItem {
  id: string;
  text: string;
  addedBy: string;
  addedAt: Date;
}

const STORAGE_KEY = 'soulsync-wishlist';

function loadWishes(): WishItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishes(wishes: WishItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  } catch {}
}

export default function Wishlist() {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<WishItem[]>(loadWishes);
  const [input, setInput] = useState('');

  useEffect(() => {
    saveWishes(wishes);
  }, [wishes]);

  const addWish = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newWish: WishItem = {
      id: Date.now().toString(),
      text: trimmed,
      addedBy: user?.displayName || 'Someone',
      addedAt: new Date(),
    };
    setWishes((prev) => [newWish, ...prev]);
    setInput('');
  }, [input, user]);

  const deleteWish = useCallback((id: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <FaHeart className="text-pink-500" size={16} />
        <h3 className="text-sm font-semibold text-white">Wishlist</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a wish..."
            onKeyDown={(e) => e.key === 'Enter' && addWish()}
          />
        </div>
        <Button onClick={addWish} disabled={!input.trim()} icon={<FaPlus size={12} />}>
          Add
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {wishes.map((wish) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 group p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all"
            >
              <FaHeart className="text-pink-500/40 shrink-0 mt-1" size={14} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 break-words">{wish.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">by {wish.addedBy}</span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(wish.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteWish(wish.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1 shrink-0"
              >
                <FaTrash size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {wishes.length === 0 && (
          <div className="text-center py-8">
            <FaHeart className="text-gray-600 mx-auto mb-2" size={24} />
            <p className="text-gray-500 text-sm">No wishes yet. Start dreaming together!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
