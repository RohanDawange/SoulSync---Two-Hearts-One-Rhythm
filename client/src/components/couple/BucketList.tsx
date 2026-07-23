import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaFilter } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface BucketItem {
  id: string;
  text: string;
  done: boolean;
  addedBy: string;
  addedAt: Date;
}

const STORAGE_KEY = 'soulsync-bucketlist';

function loadItems(): BucketItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveItems(items: BucketItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

type FilterMode = 'all' | 'done' | 'pending';

export default function BucketList() {
  const [items, setItems] = useState<BucketItem[]>(loadItems);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newItem: BucketItem = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
      addedBy: 'Me',
      addedAt: new Date(),
    };
    setItems((prev) => [...prev, newItem]);
    setInput('');
  }, [input]);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const filtered = items.filter((item) => {
    if (filter === 'done') return item.done;
    if (filter === 'pending') return !item.done;
    return true;
  });

  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">Bucket List</h3>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a bucket list item..."
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
        </div>
        <Button onClick={addItem} disabled={!input.trim()} icon={<FaPlus size={12} />}>
          Add
        </Button>
      </div>

      {total > 0 && (
        <div className="mb-3">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">{doneCount}/{total} done ({progress}%)</span>
            <div className="flex gap-1">
              {(['all', 'pending', 'done'] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 text-[10px] rounded-full transition-all ${
                    filter === f
                      ? 'bg-purple-600/40 text-white border border-purple-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 group p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <button onClick={() => toggleItem(item.id)} className="text-lg shrink-0">
                {item.done ? (
                  <FaCheckCircle className="text-green-400" size={18} />
                ) : (
                  <FaRegCircle className="text-gray-500 group-hover:text-gray-300" size={18} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm block truncate ${
                    item.done ? 'line-through text-gray-500' : 'text-gray-200'
                  }`}
                >
                  {item.text}
                </span>
                <span className="text-[10px] text-gray-600">
                  by {item.addedBy} &middot; {new Date(item.addedAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1 shrink-0"
              >
                <FaTrash size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">
            {items.length === 0 ? 'No bucket list items yet.' : 'No items match this filter.'}
          </p>
        )}
      </div>
    </Card>
  );
}
