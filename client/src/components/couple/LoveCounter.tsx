import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

const STORAGE_KEY = 'soulsync-relationship-start';

function loadStartDate(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getDays(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function createParticles() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 8 + Math.random() * 16,
  }));
}

export default function LoveCounter({ startDate }: { startDate?: string }) {
  const stored = loadStartDate();
  const effectiveDate = startDate || stored;
  const [displayCount, setDisplayCount] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [particles] = useState(createParticles);
  const prevDays = useRef(0);

  const targetDays = effectiveDate ? getDays(new Date(effectiveDate)) : 0;

  useEffect(() => {
    if (targetDays === 0) return;
    if (targetDays > prevDays.current) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      prevDays.current = targetDays;
      return () => clearTimeout(timer);
    }
  }, [targetDays]);

  useEffect(() => {
    if (targetDays === 0) return;
    const duration = 1000;
    const steps = 30;
    const increment = targetDays / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= targetDays) {
        setDisplayCount(targetDays);
        clearInterval(interval);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [targetDays]);

  if (!effectiveDate) return null;

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      <motion.div
        key={displayCount}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 180 }}
        className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
      >
        {displayCount}
      </motion.div>
      <p className="text-gray-400 text-sm mt-2">Days of Love</p>

      <AnimatePresence>
        {showParticles && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: 0, x: `${p.x}%` }}
                animate={{
                  opacity: 0,
                  y: -120,
                  x: `${p.x + (Math.random() - 0.5) * 40}%`,
                }}
                transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
                className="absolute bottom-0"
              >
                <FaHeart
                  style={{ fontSize: p.size, color: ['#ec4899', '#a855f7', '#ef4444', '#f472b6'][p.id % 4] }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!startDate && (
        <p className="text-[10px] text-gray-600 mt-4">
          Set your date in Anniversary Card
        </p>
      )}
    </div>
  );
}
