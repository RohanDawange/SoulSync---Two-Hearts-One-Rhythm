import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoPlay, IoClose, IoMusicalNote } from 'react-icons/io5';
import { IoGrid } from 'react-icons/io5';
import { FaYoutube, FaSpotify, FaSoundcloud } from 'react-icons/fa';
import { Song, MusicSource } from '@/types';
import { formatTime } from '@/utils';
import Equalizer from '@/components/player/Equalizer';

interface PlaylistItemProps {
  song: Song;
  isCurrent: boolean;
  onPlay: () => void;
  onRemove: () => void;
  index: number;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const sourceIcons: Record<MusicSource, React.ReactNode> = {
  youtube: <FaYoutube className="text-red-500" size={12} />,
  spotify: <FaSpotify className="text-green-400" size={12} />,
  soundcloud: <FaSoundcloud className="text-orange-400" size={12} />,
};

export default function PlaylistItem({ song, isCurrent, onPlay, onRemove, index, onDragStart, onDragOver, onDrop, onDragEnd }: PlaylistItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent)}
      onDragOver={(e) => onDragOver?.(e as unknown as React.DragEvent)}
      onDrop={(e) => onDrop?.(e as unknown as React.DragEvent)}
      onDragEnd={(e) => onDragEnd?.(e as unknown as React.DragEvent)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-default ${
        isCurrent
          ? 'bg-primary-500/10 border border-primary-500/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 transition-colors">
        <IoGrid size={14} />
      </div>

      <div className="w-1.5 text-center">
        <span className="text-xs text-gray-500 tabular-nums">{index + 1}</span>
      </div>

      <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary-600/40 to-accent-600/40 flex items-center justify-center">
        {song.albumArt ? (
          <img src={song.albumArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <IoMusicalNote className="text-white/40" size={14} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isCurrent ? 'text-primary-300 font-medium' : 'text-white'}`}>
          {song.title}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 truncate">{song.artist}</span>
          {song.source && (
            <span className="shrink-0">{sourceIcons[song.source]}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 tabular-nums">{formatTime(song.duration)}</span>

        <div className="flex items-center gap-1">
          {isCurrent ? (
            <Equalizer isPlaying size="sm" color="bg-primary-400" />
          ) : (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onPlay}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Play"
            >
              <IoPlay size={14} />
            </motion.button>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onRemove}
          className={`p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Remove"
        >
          <IoClose size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}
