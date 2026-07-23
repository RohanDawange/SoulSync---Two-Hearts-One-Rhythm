import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { IoCheckmark } from 'react-icons/io5';
import { useRoom } from '@/context/RoomContext';

export default function RoomCodeDisplay() {
  const { currentRoom, copyRoomCode } = useRoom();
  const [copied, setCopied] = useState(false);

  if (!currentRoom) return null;

  const handleCopy = () => {
    copyRoomCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
    >
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Room Code</p>

      <div className="flex items-center gap-1">
        {currentRoom.code.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            className="w-10 h-12 flex items-center justify-center bg-white/10 rounded-lg text-xl font-mono font-bold text-white"
          >
            {char}
          </motion.span>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
      >
        {copied ? (
          <>
            <IoCheckmark size={16} className="text-green-400" />
            <span className="text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <HiOutlineClipboardCopy size={16} />
            <span>Copy Code</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
