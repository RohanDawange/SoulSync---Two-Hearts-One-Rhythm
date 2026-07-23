import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { SOCKET_EVENTS } from '@/utils/constants';

interface IncomingReaction {
  id: string;
  emoji: string;
  senderName?: string;
  createdAt: number;
}

export default function ReactionOverlay() {
  const { socket } = useSocket();
  const { currentRoom } = useRoom();
  const [reactions, setReactions] = useState<IncomingReaction[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { reaction: string; senderName?: string }) => {
      const newReaction: IncomingReaction = {
        id: `reaction-${idCounter.current++}`,
        emoji: data.reaction,
        senderName: data.senderName,
        createdAt: Date.now(),
      };
      setReactions((prev) => [...prev.slice(-4), newReaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 3000);
    };
    socket.on(SOCKET_EVENTS.REACTION_RECEIVED, handler);
    return () => { socket.off(SOCKET_EVENTS.REACTION_RECEIVED, handler); };
  }, [socket]);

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col-reverse items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, x: 50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: -20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg"
          >
            <span className="text-2xl">{reaction.emoji}</span>
            {reaction.senderName && (
              <span className="text-xs text-gray-300">{reaction.senderName}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
