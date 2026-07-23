import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { SOCKET_EVENTS } from '@/utils/constants';

const REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😍', label: 'Crush' },
  { emoji: '👏', label: 'Clap' },
];

export default function EmojiReaction() {
  const { socket } = useSocket();
  const { currentRoom } = useRoom();
  const [sending, setSending] = useState<string | null>(null);

  const sendReaction = useCallback(
    (emoji: string) => {
      if (!socket || !currentRoom) return;
      socket.emit(SOCKET_EVENTS.REACTION_SEND, {
        roomCode: currentRoom.code,
        reaction: emoji,
      });
      setSending(emoji);
      setTimeout(() => setSending(null), 600);
    },
    [socket, currentRoom]
  );

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map(({ emoji, label }) => (
        <div key={emoji} className="relative">
          <motion.button
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => sendReaction(emoji)}
            className="p-1.5 text-lg hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title={label}
          >
            {emoji}
          </motion.button>
          <AnimatePresence>
            {sending === emoji && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -40, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none text-xl"
              >
                {emoji}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
