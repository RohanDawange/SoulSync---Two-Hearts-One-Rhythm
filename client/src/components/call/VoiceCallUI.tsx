import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaPhoneSlash } from 'react-icons/fa';
import Avatar from '@/components/ui/Avatar';

interface VoiceCallUIProps {
  isOpen: boolean;
  peerName: string;
  peerAvatar: string;
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  onEnd: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceCallUI({ isOpen, peerName, peerAvatar, status, onEnd, onToggleMute, isMuted }: VoiceCallUIProps) {
  const [callTimer, setCallTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === 'connected') {
      setCallTimer(0);
      timerRef.current = setInterval(() => setCallTimer((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const statusText = {
    calling: 'Calling...',
    ringing: 'Ringing...',
    connected: `Connected - ${formatTime(callTimer)}`,
    ended: 'Call ended',
  };

  const waveformBars = useCallback(() => {
    return Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          height: status === 'connected' ? [8, 32, 12, 28, 8] : [8],
        }}
        transition={{
          duration: 0.8 + Math.random() * 0.4,
          repeat: Infinity,
          delay: i * 0.08,
        }}
        className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
      />
    ));
  }, [status]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={status === 'connected' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Avatar src={peerAvatar} name={peerName} size="xl" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white">{peerName}</h2>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${status === 'connected' ? 'text-green-400' : 'text-gray-400'}`}>
                {statusText[status]}
              </span>
            </div>

            {status === 'connected' && (
              <div className="flex items-end gap-1 h-8">
                {waveformBars()}
              </div>
            )}

            <div className="flex items-center gap-6 mt-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggleMute}
                className={`p-4 rounded-full transition-all ${
                  isMuted
                    ? 'bg-red-600/30 text-red-400 border border-red-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10"
              >
                <FaVolumeUp size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30"
              >
                <FaPhoneSlash size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
