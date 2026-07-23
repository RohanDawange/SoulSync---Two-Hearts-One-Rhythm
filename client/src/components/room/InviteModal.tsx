import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLink, HiOutlineClipboardCopy } from 'react-icons/hi';
import { IoCheckmark, IoShareSocialOutline } from 'react-icons/io5';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { currentRoom, copyInviteLink, copyRoomCode } = useRoom();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'link' | 'code'>('link');
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const partnerCount = currentRoom?.participants.length ?? 0;
  const partner = currentRoom?.participants.find((p) => p.uid !== user?.uid);

  const handleCopy = async (type: 'link' | 'code') => {
    if (type === 'link') copyInviteLink();
    else copyRoomCode();
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const inviteUrl = currentRoom ? `${window.location.origin}/room/${currentRoom.code}` : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Your Partner">
      <div className="space-y-5">
        <div className="flex bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'link' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Invite Link
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'code' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Room Code
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'link' ? (
            <motion.div
              key="link"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <HiOutlineLink size={16} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-300 truncate">{inviteUrl}</span>
              </div>
              <Button
                fullWidth
                size="md"
                icon={copied === 'link' ? <IoCheckmark size={16} /> : <HiOutlineClipboardCopy size={16} />}
                onClick={() => handleCopy('link')}
              >
                {copied === 'link' ? 'Copied!' : 'Copy Link'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="text-center py-4">
                <span className="text-4xl font-mono font-bold text-white tracking-[0.35em]">
                  {currentRoom?.code}
                </span>
              </div>
              <Button
                fullWidth
                size="md"
                icon={copied === 'code' ? <IoCheckmark size={16} /> : <HiOutlineClipboardCopy size={16} />}
                onClick={() => handleCopy('code')}
              >
                {copied === 'code' ? 'Copied!' : 'Copy Code'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Share via</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<IoShareSocialOutline size={16} />} className="flex-1">
              Share
            </Button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-center">
          {partnerCount < 2 ? (
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex -space-x-2">
                <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
                <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">?</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">Waiting for partner to join...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex -space-x-2">
                <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
                <Avatar src={partner?.photoURL} name={partner?.displayName} size="sm" />
              </div>
              <p className="text-sm text-green-400 font-medium">Partner joined!</p>
              <p className="text-xs text-gray-500">{partner?.displayName} is here</p>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
}
