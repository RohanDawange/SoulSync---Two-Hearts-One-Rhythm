import { motion } from 'framer-motion';
import { FaBell, FaCheckDouble, FaTimes } from 'react-icons/fa';

interface Notification {
  id: string;
  icon: string;
  message: string;
  time: Date;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationList({ notifications, onMarkAllRead, onDismiss }: NotificationListProps) {
  return (
    <div className="w-72 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
          >
            <FaCheckDouble size={10} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <FaBell className="text-gray-600 mx-auto mb-2" size={20} />
            <p className="text-gray-500 text-xs">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0"
            >
              <span className="text-lg shrink-0 mt-0.5">{notif.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 break-words">{notif.message}</p>
                <span className="text-[10px] text-gray-500">{timeAgo(notif.time)}</span>
              </div>
              <button
                onClick={() => onDismiss(notif.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all p-0.5 shrink-0"
              >
                <FaTimes size={10} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
