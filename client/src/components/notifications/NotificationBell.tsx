import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell } from 'react-icons/fa';
import NotificationList from './NotificationList';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { SOCKET_EVENTS } from '@/utils/constants';

interface Notification {
  id: string;
  icon: string;
  message: string;
  time: Date;
}

export default function NotificationBell() {
  const { socket } = useSocket();
  const { currentRoom } = useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shake, setShake] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { message: string; icon?: string }) => {
      const newNotif: Notification = {
        id: Date.now().toString(),
        icon: data.icon || '💬',
        message: data.message,
        time: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    };
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handler);
    return () => { socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handler); };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = useCallback(() => setNotifications([]), []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.length;

  return (
    <div ref={ref} className="relative">
      <motion.button
        animate={shake ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
        onClick={() => setIsOpen((p) => !p)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50"
          >
            <NotificationList
              notifications={notifications}
              onMarkAllRead={markAllRead}
              onDismiss={removeNotification}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
