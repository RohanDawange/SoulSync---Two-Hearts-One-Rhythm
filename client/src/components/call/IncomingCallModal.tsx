import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaVideo, FaPhoneSlash } from 'react-icons/fa';
import Avatar from '@/components/ui/Avatar';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

const AUTO_DECLINE_MS = 30000;

export default function IncomingCallModal({
  isOpen, callerName, callerAvatar, callType, onAccept, onDecline,
}: IncomingCallModalProps) {
  const [countdown, setCountdown] = useState(AUTO_DECLINE_MS / 1000);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(AUTO_DECLINE_MS / 1000);
      return;
    }
    const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    const timer = setTimeout(() => onDecline(), AUTO_DECLINE_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isOpen, onDecline]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-sm mx-4 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Avatar src={callerAvatar} name={callerName} size="xl" className="mx-auto mb-4" />
            </motion.div>

            <h2 className="text-xl font-bold text-white mb-1">{callerName}</h2>
            <p className="text-sm text-gray-400 mb-6 flex items-center justify-center gap-2">
              {callType === 'video' ? <FaVideo size={14} /> : <FaPhone size={14} />}
              Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
            </p>

            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onDecline}
                className="flex flex-col items-center gap-2"
              >
                <div className="p-4 rounded-full bg-red-600/80 text-white shadow-lg shadow-red-600/30">
                  <FaPhoneSlash size={22} />
                </div>
                <span className="text-xs text-gray-400">Decline</span>
              </motion.button>

              <div className="text-xs text-gray-500 self-center mb-6">{countdown}s</div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 20px rgba(34,197,94,0)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                onClick={onAccept}
                className="flex flex-col items-center gap-2"
              >
                <div className="p-4 rounded-full bg-green-600/80 text-white shadow-lg shadow-green-600/30">
                  <FaPhone size={22} className="rotate-90" />
                </div>
                <span className="text-xs text-gray-400">Accept</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
