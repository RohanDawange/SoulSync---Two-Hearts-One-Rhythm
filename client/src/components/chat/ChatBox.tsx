import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return msgDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ChatBox() {
  const { messages, resetUnreadCount } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [scrolledUpUnread, setScrolledUpUnread] = useState(0);

  const scrollToBottom = useCallback(() => {
    sentinelRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isScrolledUp, scrollToBottom]);

  useEffect(() => {
    if (isScrolledUp && messages.length > 0) {
      setScrolledUpUnread((prev) => prev + 1);
    }
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setIsScrolledUp(!atBottom);
    if (atBottom) {
      setScrolledUpUnread(0);
      resetUnreadCount();
    }
  }, [resetUnreadCount]);

  const handleScrollToBottom = () => {
    scrollToBottom();
    setIsScrolledUp(false);
    setScrolledUpUnread(0);
    resetUnreadCount();
  };

  const groupedMessages: { date: string; messages: any[] }[] = [];
  let currentGroup: { date: string; messages: any[] } | null = null;

  const sorted = [...(messages || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  sorted.forEach((msg) => {
    const dateLabel = formatDateSeparator(new Date(msg.timestamp));
    if (!currentGroup || currentGroup.date !== dateLabel) {
      currentGroup = { date: dateLabel, messages: [] };
      groupedMessages.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {groupedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-400 text-sm">Start a conversation with your partner</p>
          </div>
        )}
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-3">
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
                {group.date}
              </span>
            </div>
            {group.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.uid} />
            ))}
          </div>
        ))}
        <TypingIndicator />
        <div ref={sentinelRef} />
      </div>

      <AnimatePresence>
        {isScrolledUp && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleScrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-full shadow-lg shadow-purple-600/30 z-10 transition-colors"
          >
            <FaChevronDown size={16} />
            {scrolledUpUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {scrolledUpUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
