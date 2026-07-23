import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaMusic, FaSave, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Toggle from '@/components/ui/Toggle';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { Song, MusicSource } from '@/types';

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

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [favoriteArtist, setFavoriteArtist] = useState(user?.favoriteArtist || '');
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>(user?.favoriteSongs || []);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [newSongUrl, setNewSongUrl] = useState('');

  useEffect(() => {
    const changed =
      displayName !== (user?.displayName || '') ||
      bio !== (user?.bio || '') ||
      favoriteArtist !== (user?.favoriteArtist || '') ||
      JSON.stringify(favoriteSongs) !== JSON.stringify(user?.favoriteSongs || []) ||
      photoURL !== (user?.photoURL || '');
    setHasChanges(changed);
  }, [displayName, bio, favoriteArtist, favoriteSongs, photoURL, user]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoURL(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateProfile({
      displayName,
      bio,
      favoriteArtist,
      favoriteSongs,
      photoURL,
    });
    setSaving(false);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setDisplayName(user?.displayName || '');
    setBio(user?.bio || '');
    setFavoriteArtist(user?.favoriteArtist || '');
    setFavoriteSongs(user?.favoriteSongs || []);
    setPhotoURL(user?.photoURL || '');
    setShowDiscardConfirm(false);
  };

  const addFavoriteSong = useCallback(() => {
    if (!newSongUrl.trim()) return;
    const song: Song = {
      id: `manual-${Date.now()}`,
      title: newSongUrl.trim(),
      artist: 'Unknown',
      albumArt: '',
      duration: 0,
      source: 'youtube' as MusicSource,
      url: newSongUrl.trim(),
      embedUrl: '',
    };
    setFavoriteSongs((prev) => [...prev, song]);
    setNewSongUrl('');
  }, [newSongUrl]);

  const removeFavoriteSong = useCallback((id: string) => {
    setFavoriteSongs((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
        Your <span className="text-gradient">Profile</span>
      </h1>

      <div className="space-y-6">
        <Card hover={false} className="!p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
              <Avatar src={photoURL} name={displayName || user?.displayName} size="xl" />
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera size={20} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-white">{displayName || user?.displayName}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-gray-500 text-xs mt-1">Member since {memberSince}</p>
            </div>
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Info</h2>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all resize-none"
              />
            </div>
            <Input
              label="Favorite Artist"
              value={favoriteArtist}
              onChange={(e) => setFavoriteArtist(e.target.value)}
              placeholder="e.g. Taylor Swift"
            />
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaMusic className="text-purple-400" size={16} />
            Favorite Songs
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFavoriteSong()}
              placeholder="Paste song URL or name..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
            />
            <Button size="sm" icon={<FaPlus size={12} />} onClick={addFavoriteSong} disabled={!newSongUrl.trim()}>
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {favoriteSongs.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No favorite songs added yet.</p>
            ) : (
              favoriteSongs.map((song) => (
                <div key={song.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <FaMusic className="text-gray-400" size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => removeFavoriteSong(song.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Dark Mode</p>
              <p className="text-gray-400 text-xs">Switch between dark and light theme</p>
            </div>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </Card>

        <Card hover={false} className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Email</span>
              <span className="text-white text-sm">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Member Since</span>
              <span className="text-white text-sm">{memberSince}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400 text-sm">User ID</span>
              <span className="text-white text-sm font-mono text-xs">{user?.uid?.slice(0, 12)}...</span>
            </div>
          </div>
        </Card>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 sticky bottom-4"
          >
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDiscardConfirm(true)}
              icon={<FaTrash size={14} />}
            >
              Discard
            </Button>
            <Button
              fullWidth
              onClick={handleSave}
              loading={saving}
              icon={<FaSave size={14} />}
            >
              Save Changes
            </Button>
          </motion.div>
        )}
      </div>

      <ConfirmModal isOpen={showDiscardConfirm} onClose={() => setShowDiscardConfirm(false)} title="Discard Changes">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">You have unsaved changes. Are you sure you want to discard them?</p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowDiscardConfirm(false)}>
              Keep Editing
            </Button>
            <Button variant="danger" fullWidth onClick={handleDiscard}>
              Discard
            </Button>
          </div>
        </div>
      </ConfirmModal>
    </motion.div>
  );
}
