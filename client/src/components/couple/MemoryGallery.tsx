import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

interface MemoryPhoto {
  id: string;
  src: string;
  caption: string;
  addedAt: Date;
}

const STORAGE_KEY = 'soulsync-memories';

function loadMemories(): MemoryPhoto[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMemories(memories: MemoryPhoto[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch {}
}

export default function MemoryGallery() {
  const [memories, setMemories] = useState<MemoryPhoto[]>(loadMemories);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    saveMemories(memories);
  }, [memories]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newPhoto: MemoryPhoto = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            src: reader.result as string,
            caption: '',
            addedAt: new Date(),
          };
          setMemories((prev) => [newPhoto, ...prev]);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, memories.length - 1));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Memory Gallery</h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleUpload}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <FaPlus size={10} />
          Upload
        </motion.button>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-8">
          <FaImage className="text-gray-600 mx-auto mb-2" size={32} />
          <p className="text-gray-500 text-sm">No memories yet. Start capturing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {memories.map((photo, idx) => (
              <motion.button
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                onClick={() => openLightbox(idx)}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.caption || 'Memory'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  {photo.caption && (
                    <span className="text-[10px] text-white truncate">{photo.caption}</span>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} variant="fullscreen">
        {memories.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative max-w-2xl w-full">
              <img
                src={memories[currentIndex]?.src}
                alt={memories[currentIndex]?.caption || 'Memory'}
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
              {memories[currentIndex]?.caption && (
                <p className="text-center text-gray-300 text-sm mt-4">{memories[currentIndex].caption}</p>
              )}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={prev}
                  disabled={currentIndex === 0}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white/10 rounded-full"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button
                  onClick={next}
                  disabled={currentIndex === memories.length - 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white/10 rounded-full"
                >
                  <FaChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
