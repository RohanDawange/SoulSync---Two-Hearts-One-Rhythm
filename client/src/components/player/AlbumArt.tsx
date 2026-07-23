import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoMusicalNote } from 'react-icons/io5';

interface AlbumArtProps {
  src?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-36 h-36',
  xl: 'w-56 h-56',
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 48,
  xl: 64,
};

export default function AlbumArt({ src, title, size = 'lg', isPlaying = false }: AlbumArtProps) {
  const [imgError, setImgError] = useState(false);
  const dimension = sizeMap[size];
  const iconSize = iconSizes[size];

  return (
    <motion.div
      className={`relative ${dimension} shrink-0`}
      animate={{ rotate: isPlaying && src ? 360 : 0 }}
      transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
    >
      <div className={`w-full h-full ${size === 'sm' || size === 'md' ? 'rounded-lg' : 'rounded-2xl'} overflow-hidden bg-gradient-to-br from-primary-600/40 to-accent-600/40 ring-1 ring-white/10`}>
        {src && !imgError ? (
          <img
            src={src}
            alt={title || 'Album art'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoMusicalNote size={iconSize} className="text-white/40" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
    </motion.div>
  );
}
