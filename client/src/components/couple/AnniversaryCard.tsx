import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaCalendarAlt, FaGift } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const STORAGE_KEY = 'soulsync-anniversary';

function loadAnniversary(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveAnniversary(date: string) {
  try {
    localStorage.setItem(STORAGE_KEY, date);
  } catch {}
}

function getDaysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getDaysUntilNext(date: Date): number {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const anniversary = new Date(current.getFullYear(), date.getMonth(), date.getDate());
  if (anniversary.getTime() < current.getTime()) {
    anniversary.setFullYear(anniversary.getFullYear() + 1);
  }
  return Math.ceil((anniversary.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AnniversaryCard() {
  const [anniversaryDate, setAnniversaryDate] = useState<string | null>(loadAnniversary);
  const [editing, setEditing] = useState(!anniversaryDate);
  const [inputDate, setInputDate] = useState(anniversaryDate || '');

  const daysSince = useMemo(
    () => (anniversaryDate ? getDaysSince(new Date(anniversaryDate)) : 0),
    [anniversaryDate]
  );
  const daysUntil = useMemo(
    () => (anniversaryDate ? getDaysUntilNext(new Date(anniversaryDate)) : 0),
    [anniversaryDate]
  );

  const handleSave = () => {
    if (inputDate) {
      setAnniversaryDate(inputDate);
      saveAnniversary(inputDate);
      setEditing(false);
    }
  };

  return (
    <Card glow className="text-center">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaHeart className="text-pink-500" size={36} />
        </motion.div>

        {editing ? (
          <div className="w-full max-w-xs space-y-3">
            <Input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              label="Our Anniversary"
            />
            <Button onClick={handleSave} disabled={!inputDate} fullWidth>
              Set Anniversary
            </Button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={daysSince}
                initial={{ opacity: 0, y: -20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                {daysSince}
              </motion.div>
            </AnimatePresence>
            <p className="text-gray-300 text-sm">Together for</p>
            <p className="text-xl font-semibold text-white">{daysSince} days</p>

            {daysUntil > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <FaGift className="text-yellow-400" size={14} />
                <span>Next anniversary in {daysUntil} days</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              icon={<FaCalendarAlt size={12} />}
              onClick={() => setEditing(true)}
            >
              Change Date
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
