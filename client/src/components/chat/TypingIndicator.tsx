import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/context/ChatContext';

export default function TypingIndicator() {
  const { isTyping, typingUser } = useChat();

  return (
    <AnimatePresence>
      {isTyping && typingUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          <div className="flex items-center gap-1">
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
            />
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
            />
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
            />
          </div>
          <span className="text-xs text-gray-400">
            {typingUser} is typing...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
