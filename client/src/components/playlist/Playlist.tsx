import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMusicalNote } from 'react-icons/io5';
import { Song } from '@/types';
import PlaylistItem from './PlaylistItem';

interface PlaylistProps {
  songs: Song[];
  currentSongId?: string;
  onPlaySong: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
  onReorder?: (songs: Song[]) => void;
}

export default function Playlist({ songs, currentSongId, onPlaySong, onRemoveSong, onReorder }: PlaylistProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex.current = index;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));

    if (isNaN(sourceIndex) || sourceIndex === dropIndex || !onReorder) return;

    const reordered = [...songs];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    onReorder(reordered);

    setDragIndex(null);
    dragOverIndex.current = null;
  }, [songs, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    dragOverIndex.current = null;
  }, []);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <IoMusicalNote size={28} className="text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm font-medium">No songs in playlist yet.</p>
        <p className="text-gray-500 text-xs mt-1">Add your first song!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Playlist
          <span className="ml-2 text-gray-500 font-normal normal-case">({songs.length})</span>
        </h3>
      </div>

      <div className="space-y-0.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence>
          {songs.map((song, index) => (
            <PlaylistItem
              key={song.id}
              song={song}
              index={index}
              isCurrent={song.id === currentSongId}
              onPlay={() => onPlaySong(song)}
              onRemove={() => onRemoveSong(song.id)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
