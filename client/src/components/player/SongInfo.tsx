import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube, FaSpotify, FaSoundcloud } from 'react-icons/fa';
import { Song } from '@/types';
import AlbumArt from './AlbumArt';
import Skeleton from '@/components/ui/Skeleton';

interface SongInfoProps {
  song: Song | null;
  showSource?: boolean;
}

const sourceConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  youtube: { icon: <FaYoutube />, color: 'text-red-500' },
  spotify: { icon: <FaSpotify />, color: 'text-green-400' },
  soundcloud: { icon: <FaSoundcloud />, color: 'text-orange-400' },
};

export default function SongInfo({ song, showSource = true }: SongInfoProps) {
  return (
    <AnimatePresence mode="wait">
      {song ? (
        <motion.div
          key={song.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-3 min-w-0"
        >
          <AlbumArt src={song.albumArt} title={song.title} size="md" />

          <div className="min-w-0 flex-1">
            <p className="text-white font-medium text-sm truncate">{song.title}</p>
            <p className="text-gray-400 text-xs truncate">{song.artist}</p>
            {showSource && song.source && (
              <span className={`inline-flex items-center gap-1 text-xs mt-0.5 ${sourceConfig[song.source]?.color || 'text-gray-500'}`}>
                {sourceConfig[song.source]?.icon}
                <span className="capitalize">{song.source}</span>
              </span>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3"
        >
          <Skeleton variant="circle" className="w-14 h-14" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-32" />
            <Skeleton variant="text" className="w-20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
