import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPhone, FaVideo } from 'react-icons/fa';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useSocket } from '@/context/SocketContext';

interface ChatHeaderProps {
  onBack?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ChatHeader({ onBack, onVoiceCall, onVideoCall }: ChatHeaderProps) {
  const { currentRoom } = useRoom();
  const { user } = useAuth();
  const { currentSong } = usePlayer();

  const partner = useMemo(() => {
    if (!currentRoom?.participants || !user) return null;
    return currentRoom.participants.find((p) => p.uid !== user.uid) || null;
  }, [currentRoom, user]);

  if (!partner) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <span className="text-sm text-gray-400">No partner connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="md:hidden p-1 text-gray-400 hover:text-white transition-colors"
        >
          <FaArrowLeft size={18} />
        </motion.button>
      )}
      <Avatar src={partner.photoURL} name={partner.displayName} size="md" online={partner.online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{partner.displayName}</span>
          <span className={`w-2 h-2 rounded-full ${partner.online ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {currentSong ? (
            <Badge variant="info" size="sm">
              🎵 Listening...
            </Badge>
          ) : partner.online ? (
            <span className="text-[11px] text-gray-500">Online</span>
          ) : (
            <span className="text-[11px] text-gray-500">
              Last seen {timeAgo(new Date(partner.lastActive || Date.now()))}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onVoiceCall}
          className="p-2.5 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded-xl transition-all"
        >
          <FaPhone size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onVideoCall}
          className="p-2.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all"
        >
          <FaVideo size={18} />
        </motion.button>
      </div>
    </div>
  );
}
