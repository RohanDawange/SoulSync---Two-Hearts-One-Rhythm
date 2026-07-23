import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube, FaSpotify, FaSoundcloud, FaApple, FaAmazon, FaMusic } from 'react-icons/fa';
import { IoMusicalNote } from 'react-icons/io5';
import { MusicSource } from '@/types';
import { isValidYouTubeUrl, isValidSpotifyUrl, isValidSoundCloudUrl, extractYouTubeId, extractSpotifyId } from '@/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface SourceSelectorProps {
  onLoad: (source: MusicSource, url: string, id: string) => void;
}

const sources: { id: MusicSource; label: string; icon: React.ReactNode; color: string; placeholder: string }[] = [
  { id: 'youtube', label: 'YouTube', icon: <FaYoutube />, color: 'text-red-500', placeholder: 'https://youtube.com/watch?v=...' },
  { id: 'spotify', label: 'Spotify', icon: <FaSpotify />, color: 'text-green-400', placeholder: 'https://open.spotify.com/track/...' },
  { id: 'soundcloud', label: 'SoundCloud', icon: <FaSoundcloud />, color: 'text-orange-400', placeholder: 'https://soundcloud.com/...' },
];

const comingSoon = [
  { id: 'applemusic', label: 'Apple Music', icon: <FaApple />, color: 'text-red-400' },
  { id: 'jiosaavn', label: 'JioSaavn', icon: <FaMusic />, color: 'text-green-400' },
  { id: 'gaana', label: 'Gaana', icon: <FaMusic />, color: 'text-red-400' },
  { id: 'amazonmusic', label: 'Amazon Music', icon: <FaAmazon />, color: 'text-orange-400' },
];

export default function SourceSelector({ onLoad }: SourceSelectorProps) {
  const [activeSource, setActiveSource] = useState<MusicSource>('youtube');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

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

  const handleLoad = useCallback(() => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValid(activeSource, url.trim())) {
      setError(`Invalid ${activeSource} URL`);
      return;
    }

    const id = extractId(activeSource, url.trim());
    if (!id) {
      setError('Could not extract ID from URL');
      return;
    }

    setError('');
    onLoad(activeSource, url.trim(), id);
  }, [url, activeSource, isValid, extractId, onLoad]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLoad();
  }, [handleLoad]);

  const showPreview = url.trim().length > 5 && isValid(activeSource, url.trim());

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => { setActiveSource(source.id); setUrl(''); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSource === source.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={source.color}>{source.icon}</span>
            <span className="hidden sm:inline">{source.label}</span>
          </button>
        ))}
      </div>

      {activeSource && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder={sources.find((s) => s.id === activeSource)?.placeholder || 'Paste URL...'}
              className={`w-full px-4 py-3 pr-10 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-500 outline-none transition-colors ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
              }`}
            />
            {url && (
              <button
                onClick={() => { setUrl(''); setError(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <IoMusicalNote size={16} />
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 pl-1">{error}</p>
          )}

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600/40 to-accent-600/40 flex items-center justify-center">
                  <IoMusicalNote className="text-white/40" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">Song from {activeSource}</p>
                  <p className="text-gray-400 text-xs truncate">{url}</p>
                </div>
                <Badge variant="success" size="sm">Valid</Badge>
              </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={handleLoad} fullWidth>
            Load Song
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-2">
        {comingSoon.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 opacity-50 cursor-not-allowed"
          >
            <span className={item.color}>{item.icon}</span>
            <span className="text-xs text-gray-400">{item.label}</span>
            <Badge variant="warning" size="sm" className="ml-auto">Soon</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
