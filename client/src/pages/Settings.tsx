import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoon, FaSun, FaBell, FaEye, FaBan, FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Avatar from '@/components/ui/Avatar';
import { useTheme } from '@/context/ThemeContext';

interface NotificationSettings {
  partnerJoined: boolean;
  songChanged: boolean;
  newMessage: boolean;
  incomingCall: boolean;
}

interface PrivacySettings {
  showOnlineStatus: boolean;
  showListeningStatus: boolean;
}

function ConfirmModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
              <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                <FaTimes size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    partnerJoined: true,
    songChanged: true,
    newMessage: true,
    incomingCall: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showOnlineStatus: true,
    showListeningStatus: true,
  });

  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [blockedUsers] = useState<string[]>([]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  const notificationOptions = [
    { key: 'partnerJoined' as const, label: 'Partner Joined', description: 'When your partner joins the room' },
    { key: 'songChanged' as const, label: 'Song Changed', description: 'When a new song starts playing' },
    { key: 'newMessage' as const, label: 'New Message', description: 'When you receive a chat message' },
    { key: 'incomingCall' as const, label: 'Incoming Call', description: 'When your partner calls you' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
        <span className="text-gradient">Settings</span>
      </h1>

      <div className="space-y-6">
        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {theme === 'dark' ? <FaMoon className="text-purple-400" size={16} /> : <FaSun className="text-yellow-400" size={16} />}
            Theme
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-gray-400 text-xs">Choose your preferred appearance</p>
            </div>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[40, 60, 30].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-gray-700" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="h-12 rounded-lg bg-gray-800" />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Dark</p>
            </div>
            <div
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[40, 60, 30].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-gray-300" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="h-12 rounded-lg bg-gray-200" />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Light</p>
            </div>
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaBell className="text-yellow-400" size={16} />
            Notifications
          </h2>
          <div className="space-y-4">
            {notificationOptions.map((opt) => (
              <div key={opt.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white text-sm font-medium">{opt.label}</p>
                  <p className="text-gray-400 text-xs">{opt.description}</p>
                </div>
                <Toggle
                  checked={notifications[opt.key]}
                  onChange={(checked) => setNotifications((prev) => ({ ...prev, [opt.key]: checked }))}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaEye className="text-blue-400" size={16} />
            Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-white text-sm font-medium">Show Online Status</p>
                <p className="text-gray-400 text-xs">Let others see when you&apos;re online</p>
              </div>
              <Toggle
                checked={privacy.showOnlineStatus}
                onChange={(checked) => setPrivacy((prev) => ({ ...prev, showOnlineStatus: checked }))}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-white text-sm font-medium">Show Listening Status</p>
                <p className="text-gray-400 text-xs">Let others see what you&apos;re listening to</p>
              </div>
              <Toggle
                checked={privacy.showListeningStatus}
                onChange={(checked) => setPrivacy((prev) => ({ ...prev, showListeningStatus: checked }))}
              />
            </div>
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaBan className="text-red-400" size={16} />
            Blocked Users
          </h2>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No blocked users</p>
              <p className="text-gray-600 text-xs mt-1">You haven&apos;t blocked anyone yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((userId) => (
                <div key={userId} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar name="User" size="sm" />
                    <span className="text-white text-sm">{userId}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="!text-red-400">
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false} className="!p-6 border-red-500/20">
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <FaExclamationTriangle size={16} />
            Danger Zone
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="danger"
            icon={<FaTrash size={14} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        </Card>

        <div className="pt-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleSave}
            loading={saving}
          >
            Save Settings
          </Button>
        </div>
      </div>

      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <FaExclamationTriangle className="text-red-400 shrink-0" size={20} />
            <p className="text-red-300 text-sm">
              This action is permanent and cannot be undone. All your data will be lost.
            </p>
          </div>
          <p className="text-gray-300 text-sm">
            Are you absolutely sure you want to delete your account?
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleDeleteAccount}>
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      </ConfirmModal>
    </motion.div>
  );
}
