import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube, FaSpotify, FaSoundcloud } from 'react-icons/fa';
import { IoMusicalNote, IoCheckmarkCircle } from 'react-icons/io5';
import { MusicSource } from '@/types';
import { extractYouTubeId, extractSpotifyId, isValidYouTubeUrl, isValidSpotifyUrl, isValidSoundCloudUrl, getEmbedUrl } from '@/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlaylist: (source: MusicSource, url: string, id: string) => void;
  onPlayNow: (source: MusicSource, url: string, id: string) => void;
}

const tabs: { id: MusicSource; label: string; icon: React.ReactNode; color: string; placeholder: string }[] = [
  { id: 'youtube', label: 'YouTube', icon: <FaYoutube />, color: 'text-red-500', placeholder: 'https://youtube.com/watch?v=...' },
  { id: 'spotify', label: 'Spotify', icon: <FaSpotify />, color: 'text-green-400', placeholder: 'https://open.spotify.com/track/...' },
  { id: 'soundcloud', label: 'SoundCloud', icon: <FaSoundcloud />, color: 'text-orange-400', placeholder: 'https://soundcloud.com/...' },
];

export default function AddSongModal({ isOpen, onClose, onAddToPlaylist, onPlayNow }: AddSongModalProps) {
  const [activeTab, setActiveTab] = useState<MusicSource>('youtube');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const extractId = useCallback((source: MusicSource, input: string): string | null => {
    switch (source) {
      case 'youtube': return extractYouTubeId(input);
      case 'spotify': return extractSpotifyId(input);
      case 'soundcloud': return input;
      default: return null;
    }
  }, []);

  const isValid = useCallback((source: MusicSource, input: string): boolean => {
    switch (source) {
      case 'youtube': return isValidYouTubeUrl(input);
      case 'spotify': return isValidSpotifyUrl(input);
      case 'soundcloud': return isValidSoundCloudUrl(input);
      default: return false;
    }
  }, []);

  const handleTabChange = useCallback((tab: MusicSource) => {
    setActiveTab(tab);
    setUrl('');
    setError('');
    setSuccess(false);
  }, []);

  const validate = useCallback((): string | null => {
    if (!url.trim()) return 'Please enter a URL';
    if (!isValid(activeTab, url.trim())) return `Invalid ${activeTab} URL`;
    const id = extractId(activeTab, url.trim());
    if (!id) return 'Could not extract ID from URL';
    return null;
  }, [url, activeTab, isValid, extractId]);

  const handleAdd = useCallback(() => {
    const err = validate();
    if (err) { setError(err); return; }
    const id = extractId(activeTab, url.trim())!;
    setSuccess(true);
    setTimeout(() => {
      onAddToPlaylist(activeTab, url.trim(), id);
      setUrl('');
      setError('');
      setSuccess(false);
      onClose();
    }, 600);
  }, [validate, extractId, activeTab, url, onAddToPlaylist, onClose]);

  const handlePlayNow = useCallback(() => {
    const err = validate();
    if (err) { setError(err); return; }
    const id = extractId(activeTab, url.trim())!;
    onPlayNow(activeTab, url.trim(), id);
    setUrl('');
    setError('');
    onClose();
  }, [validate, extractId, activeTab, url, onPlayNow, onClose]);

  const showPreview = url.trim().length > 5 && isValid(activeTab, url.trim()) && !error;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Song">
      <div className="space-y-4">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={tab.color}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); setSuccess(false); }}
            placeholder={tabs.find((t) => t.id === activeTab)?.placeholder || 'Paste URL...'}
            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-500 outline-none transition-colors ${
              error ? 'border-red-500/50' : success ? 'border-green-500/50' : 'border-white/10 focus:border-primary-500'
            }`}
          />
          {url && (
            <button
              onClick={() => { setUrl(''); setError(''); setSuccess(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <IoMusicalNote size={16} />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600/40 to-accent-600/40 flex items-center justify-center shrink-0">
                <IoMusicalNote className="text-white/40" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{activeTab} track</p>
                <p className="text-gray-400 text-xs truncate">{url}</p>
              </div>
              <Badge variant="success" size="sm">Valid</Badge>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-2 text-green-400"
            >
              <IoCheckmarkCircle size={18} />
              <span className="text-sm font-medium">Added!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handlePlayNow} disabled={success} fullWidth>
            Play Now
          </Button>
          <Button onClick={handleAdd} disabled={success} fullWidth>
            Add to Playlist
          </Button>
        </div>
      </div>
    </Modal>
  );
}
