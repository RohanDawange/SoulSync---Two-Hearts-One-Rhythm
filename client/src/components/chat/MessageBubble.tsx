import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaCheckDouble, FaExpand } from 'react-icons/fa';
import { Message } from '@/types/message';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isImage = message.type === 'image' || message.type === 'gif';

  const toggleReactions = useCallback(() => setShowReactions((p) => !p), []);

  const bubbleVariants = {
    initial: { opacity: 0, x: isOwn ? 20 : -20 },
    animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 260 } },
  };

  const quickReactions = ['❤️', '🔥', '😂', '😍', '😢', '👍'];

  return (
    <>
      <motion.div
        variants={bubbleVariants}
        initial="initial"
        animate="animate"
        className={`flex items-end gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwn && (
          <Avatar
            src={message.senderAvatar}
            name={message.senderName}
            size="sm"
            className="mb-1"
          />
        )}
        <div className={`max-w-[75%] group ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          <div
            className={`relative px-4 py-2.5 rounded-2xl break-words whitespace-pre-wrap ${
              isOwn
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-md'
                : 'bg-white/10 text-gray-100 rounded-bl-md'
            }`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            onContextMenu={(e) => { e.preventDefault(); toggleReactions(); }}
          >
            {isImage ? (
              <button onClick={() => setLightboxOpen(true)} className="block relative group/img">
                <img
                  src={message.content}
                  alt="Shared media"
                  className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <FaExpand className="text-white" size={20} />
                </div>
              </button>
            ) : (
              <span className="text-sm leading-relaxed">{message.content}</span>
            )}

            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className="text-[10px] text-white/50">{formatTime(message.timestamp)}</span>
              {isOwn && (
                <span className="text-[10px]">
                  {message.seen ? (
                    <FaCheckDouble className="text-blue-400" size={10} />
                  ) : (
                    <FaCheck className="text-white/50" size={10} />
                  )}
                </span>
              )}
            </div>

            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute -bottom-8 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 bg-black/70 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 shadow-lg z-10`}
                >
                  {quickReactions.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-base hover:scale-125 transition-transform cursor-pointer"
                      onClick={toggleReactions}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} variant="fullscreen">
        <div className="flex items-center justify-center h-full">
          <img
            src={message.content}
            alt="Lightbox"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
        {message.content && (
          <p className="text-center text-gray-300 text-sm mt-4">{message.content}</p>
        )}
      </Modal>
    </>
  );
}
