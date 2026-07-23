import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSignOutAlt, FaPhone, FaVideo, FaShareAlt, FaChevronUp, FaChevronDown, FaMusic, FaCommentDots, FaHeart as FaHeartIcon } from 'react-icons/fa';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useChat } from '@/context/ChatContext';
import MusicPlayer from '@/components/player/MusicPlayer';
import Playlist from '@/components/playlist/Playlist';
import ChatBox from '@/components/chat/ChatBox';
import ChatInput from '@/components/chat/ChatInput';
import PartnerStatus from '@/components/room/PartnerStatus';
import RoomCodeDisplay from '@/components/room/RoomCodeDisplay';
import InviteModal from '@/components/room/InviteModal';
import EmojiReaction from '@/components/reactions/EmojiReaction';
import ReactionOverlay from '@/components/reactions/ReactionOverlay';
import FloatingHearts from '@/components/reactions/FloatingHearts';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { Song } from '@/types';
import AnniversaryCard from '@/components/couple/AnniversaryCard';

type MobileTab = 'player' | 'chat' | 'couple';

export default function Room() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentRoom, joinRoom, leaveRoom, isLoading: roomLoading, error } = useRoom();
  const { currentSong, isPlaying, changeSong } = usePlayer();
  const { messages, unreadCount, resetUnreadCount } = useChat();
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCouple, setShowCouple] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('player');
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (code && !currentRoom && !roomLoading && !hasJoined) {
      joinRoom(code);
      setHasJoined(true);
    }
  }, [code, currentRoom, roomLoading, joinRoom, hasJoined]);

  const handleLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    leaveRoom();
    navigate('/dashboard');
  }, [leaveRoom, navigate]);

  const handleReaction = useCallback(() => {
    setHeartTrigger((prev) => prev + 1);
  }, []);

  const handlePlaySong = useCallback((song: Song) => {
    changeSong(song);
  }, [changeSong]);

  const handleRemoveSong = useCallback((songId: string) => {
  }, []);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2">Room Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setHasJoined(false); joinRoom(code || ''); }}>
              Retry
            </Button>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Joining room...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">No Room Active</h2>
          <p className="text-gray-400 mb-6">Create or join a room to start listening together.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const playlist = currentRoom.playlist || [];
  const partner = currentRoom.participants.find((p) => p.uid !== user?.uid);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 overflow-hidden"
    >
      <FloatingHearts trigger={heartTrigger} />
      <ReactionOverlay />

      <header className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <FaHeart className="text-pink-500 group-hover:scale-110 transition-transform" size={20} />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:inline">
              SoulSync
            </span>
          </Link>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <RoomCodeDisplay />
        </div>

        <div className="flex items-center gap-2">
          {partner && <PartnerStatus />}
          <Button
            variant="secondary"
            size="sm"
            icon={<FaShareAlt size={14} />}
            onClick={() => setShowInvite(true)}
            className="!hidden sm:!inline-flex"
          >
            Invite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<FaPhone size={14} />}
            className="!hidden sm:!inline-flex"
            title="Voice Call"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<FaVideo size={14} />}
            className="!hidden sm:!inline-flex"
            title="Video Call"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<FaSignOutAlt size={14} />}
            onClick={() => setShowLeaveConfirm(true)}
            className="!text-red-400 hover:!text-red-300"
            title="Leave Room"
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="w-[60%] flex flex-col overflow-y-auto p-4 gap-4">
            <MusicPlayer />
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <Playlist
                songs={playlist}
                currentSongId={currentSong?.id}
                onPlaySong={handlePlaySong}
                onRemoveSong={handleRemoveSong}
              />
            </div>
          </div>

          <div className="w-[40%] flex flex-col border-l border-white/10">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <FaCommentDots className="text-purple-400" size={14} />
                  Chat
                  {unreadCount > 0 && (
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <EmojiReaction />
              </div>
              <ChatBox />
              <ChatInput />
            </div>

            <button
              onClick={() => setShowCouple(!showCouple)}
              className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5 hover:bg-white/10 transition-colors shrink-0"
            >
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FaHeartIcon className="text-pink-400" size={14} />
                Couple Space
              </span>
              {showCouple ? <FaChevronDown size={14} className="text-gray-400" /> : <FaChevronUp size={14} className="text-gray-400" />}
            </button>

            <AnimatePresence>
              {showCouple && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                    <AnniversaryCard />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex md:hidden flex-1 flex-col">
          <div className="flex border-b border-white/10 bg-black/20">
            {(['player', 'chat', 'couple'] as MobileTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMobileTab(tab);
                  if (tab === 'chat') resetUnreadCount();
                }}
                className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors relative ${
                  mobileTab === tab ? 'text-white' : 'text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {tab === 'player' && <FaMusic size={12} />}
                  {tab === 'chat' && <FaCommentDots size={12} />}
                  {tab === 'couple' && <FaHeartIcon size={12} />}
                  {tab === 'player' && 'Player'}
                  {tab === 'chat' && 'Chat'}
                  {tab === 'couple' && 'Couple'}
                  {tab === 'chat' && unreadCount > 0 && (
                    <span className="bg-purple-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {mobileTab === tab && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {mobileTab === 'player' && (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto p-4 space-y-4"
                >
                  <MusicPlayer />
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <Playlist
                      songs={playlist}
                      currentSongId={currentSong?.id}
                      onPlaySong={handlePlaySong}
                      onRemoveSong={handleRemoveSong}
                    />
                  </div>
                </motion.div>
              )}
              {mobileTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
                    <EmojiReaction />
                  </div>
                  <ChatBox />
                  <ChatInput />
                </motion.div>
              )}
              {mobileTab === 'couple' && (
                <motion.div
                  key="couple"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto p-4"
                >
                  <AnniversaryCard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border-t border-white/10 shrink-0">
        <EmojiReaction />
        <Button
          variant="secondary"
          size="sm"
          icon={<FaShareAlt size={12} />}
          onClick={() => setShowInvite(true)}
        >
          Invite
        </Button>
      </div>

      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} />

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
    </motion.div>
  );
}
