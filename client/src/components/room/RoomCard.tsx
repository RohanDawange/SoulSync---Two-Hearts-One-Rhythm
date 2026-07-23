import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCopy, HiOutlineUsers, HiOutlineChat, HiOutlineMusicNote, HiOutlinePhone, HiOutlineLogout } from 'react-icons/hi';
import { IoCheckmark } from 'react-icons/io5';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import type { RoomParticipant } from '@/types/room';

interface RoomCardProps {
  onNavigateChat?: () => void;
  onNavigateMusic?: () => void;
  onNavigateCall?: () => void;
}

export default function RoomCard({ onNavigateChat, onNavigateMusic, onNavigateCall }: RoomCardProps) {
  const { currentRoom, copyRoomCode, copyInviteLink, leaveRoom, isLoading } = useRoom();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!currentRoom) return null;

  const partner: RoomParticipant | undefined = currentRoom.participants.find((p) => p.uid !== user?.uid);
  const isCurrentSong = currentRoom.currentSong;

  const handleCopyCode = async () => {
    copyRoomCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    setShowLeaveConfirm(false);
    leaveRoom();
  };

  return (
    <>
      <Card className="!p-6 space-y-5" glow>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Room Code</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-white tracking-[0.25em]">
                {currentRoom.code}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <IoCheckmark size={18} className="text-green-400" /> : <HiOutlineClipboardCopy size={18} />}
              </motion.button>
            </div>
          </div>
          <Badge variant={currentRoom.participants.length >= 2 ? 'success' : 'warning'}>
            {currentRoom.participants.length}/2
          </Badge>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <Avatar
            src={partner?.photoURL}
            name={partner?.displayName}
            size="lg"
            online={partner?.online}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{partner?.displayName || 'Waiting...'}</p>
            <p className="text-xs text-gray-400">
              {partner ? (partner.online ? 'Online' : 'Offline') : 'Not joined yet'}
            </p>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${partner?.online ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>

        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Now Playing</p>
          {isCurrentSong ? (
            <div className="flex items-center gap-3">
              <img
                src={currentRoom.currentSong!.albumArt}
                alt={currentRoom.currentSong!.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate">{currentRoom.currentSong!.title}</p>
                <p className="text-gray-400 text-xs truncate">{currentRoom.currentSong!.artist}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">Nothing playing</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<HiOutlineClipboardCopy size={16} />}
            onClick={copyInviteLink}
            className="flex-1"
          >
            Invite
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<HiOutlineChat size={16} />}
            onClick={onNavigateChat}
            className="flex-1"
          >
            Chat
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<HiOutlineMusicNote size={16} />}
            onClick={onNavigateMusic}
            className="flex-1"
          >
            Music
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<HiOutlinePhone size={16} />}
            onClick={onNavigateCall}
            className="flex-1"
          >
            Call
          </Button>
        </div>

        <Button
          variant="danger"
          fullWidth
          size="sm"
          icon={<HiOutlineLogout size={16} />}
          onClick={() => setShowLeaveConfirm(true)}
          loading={isLoading}
        >
          Leave Room
        </Button>
      </Card>

      <Modal isOpen={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)} title="Leave Room">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Are you sure you want to leave this room? Your partner will be disconnected.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowLeaveConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleLeave}>
              Leave
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
