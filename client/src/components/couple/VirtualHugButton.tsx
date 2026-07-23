import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useRoom } from '@/context/RoomContext';
import { SOCKET_EVENTS } from '@/utils/constants';

const COOLDOWN_MS = 3000;

export default function VirtualHugButton() {
  const { socket } = useSocket();
  const { currentRoom } = useRoom();
  const [sent, setSent] = useState(false);
  const [received, setReceived] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { senderName: string }) => {
      setReceived(true);
      setTimeout(() => setReceived(false), 3000);
    };
    socket.on(SOCKET_EVENTS.COUPLE_HUG, handler);
    return () => { socket.off(SOCKET_EVENTS.COUPLE_HUG, handler); };
  }, [socket]);

  const sendHug = useCallback(() => {
    if (cooldown || !socket || !currentRoom) return;
    socket.emit(SOCKET_EVENTS.COUPLE_HUG, { roomCode: currentRoom.code });
    setSent(true);
    setCooldown(true);
    setTimeout(() => setSent(false), 2000);
    cooldownRef.current = setTimeout(() => setCooldown(false), COOLDOWN_MS);
  }, [cooldown, socket, currentRoom]);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearTimeout(cooldownRef.current); };
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        animate={cooldown ? {} : { scale: [1, 1.08, 1], transition: { duration: 1.5, repeat: Infinity } }}
        onClick={sendHug}
        disabled={cooldown}
        className={`relative text-5xl p-6 rounded-full transition-all ${
          cooldown
            ? 'opacity-50 cursor-not-allowed bg-white/5'
            : 'bg-white/10 hover:bg-white/20 cursor-pointer shadow-lg shadow-pink-500/20'
        } border border-white/10`}
      >
        🤗
      </motion.button>
      <span className="text-xs text-gray-400">Send a Hug</span>

      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-green-400 font-medium"
          >
            You sent a hug! 🤗
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {received && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/20 text-center"
          >
            <div className="text-3xl mb-2">🤗</div>
            <p className="text-white font-medium">Partner sent you a hug! 🤗</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

