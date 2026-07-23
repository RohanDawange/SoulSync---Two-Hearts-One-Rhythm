import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';

type PartnerStatus = 'online' | 'offline' | 'typing' | 'listening';

const statusConfig: Record<PartnerStatus, { dotColor: string; label: string }> = {
  online: { dotColor: 'bg-green-500', label: 'Online' },
  offline: { dotColor: 'bg-gray-500', label: 'Offline' },
  typing: { dotColor: 'bg-yellow-400', label: 'Typing' },
  listening: { dotColor: 'bg-blue-400', label: 'Listening' },
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-gray-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

function EqualizerBars() {
  return (
    <span className="inline-flex items-center gap-[2px] ml-1">
      {[2, 3, 1, 4, 2].map((h, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-blue-400"
          style={{ height: `${h * 4}px` }}
          animate={{ height: [h * 4, h * 8, h * 3, h * 6, h * 4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

export default function PartnerStatus() {
  const { currentRoom } = useRoom();
  const { user } = useAuth();
  const [status, setStatus] = useState<PartnerStatus>('offline');

  const partner = currentRoom?.participants.find((p) => p.uid !== user?.uid);

  useEffect(() => {
    if (!partner) { setStatus('offline'); return; }
    if (!partner.online) { setStatus('offline'); return; }
    if (currentRoom?.isPlaying && currentRoom?.currentSong) {
      setStatus('listening');
    } else {
      setStatus('online');
    }
  }, [partner, currentRoom?.isPlaying, currentRoom?.currentSong]);

  if (!partner) return null;

  const config = statusConfig[status];

  return (
    <motion.div
      layout
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="relative">
        <Avatar src={partner.photoURL} name={partner.displayName} size="md" />
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${config.dotColor}`}
          />
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{partner.displayName}</p>
        <div className="flex items-center text-xs text-gray-400">
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center"
            >
              {config.label}
              {status === 'typing' && <TypingDots />}
              {status === 'listening' && <EqualizerBars />}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
