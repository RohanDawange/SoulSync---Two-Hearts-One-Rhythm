import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaYoutube, FaSpotify, FaSoundcloud } from 'react-icons/fa';
import { usePlayer } from '@/context/PlayerContext';
import Slider from '@/components/ui/Slider';

const sourceIcons: Record<string, React.ReactNode> = {
  youtube: <FaYoutube size={14} className="text-red-500" />,
  spotify: <FaSpotify size={14} className="text-green-500" />,
  soundcloud: <FaSoundcloud size={14} className="text-orange-500" />,
};

export default function BottomPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted,
    play, pause, seek, setVolume, toggleMute, next, prev,
  } = usePlayer();

  const [expanded, setExpanded] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    seek(x * duration);
  };

  const eqBars = [8, 12, 10, 16, 14, 18, 11, 9];

  return (
    <>
      <div className="h-20" />

      <motion.div
        layout
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className={`fixed bottom-0 left-0 right-0 z-30 bg-black/70 backdrop-blur-xl border-t border-white/10 ${
          expanded ? 'h-full' : 'h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4">
          {/* Collapsed bar */}
          {!expanded && (
            <div className="flex items-center h-full gap-3" onClick={() => setExpanded(true)}>
              <img
                src={currentSong.albumArt}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-1">
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-4 mr-1">
                    {eqBars.map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, h, 4] }}
                        transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-[3px] rounded-full bg-gradient-to-t from-purple-500 to-pink-500"
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaStepBackward size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(); }}
                  className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-shadow"
                >
                  {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaStepForward size={14} />
                </button>
              </div>
              {currentSong.source && sourceIcons[currentSong.source] && (
                <div className="shrink-0 ml-1">{sourceIcons[currentSong.source]}</div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block"
              >
                <FaExpand size={14} />
              </button>
            </div>
          )}

          {/* Expanded player */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-6 py-8"
              >
                <button
                  onClick={() => setExpanded(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaCompress size={18} />
                </button>

                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                />

                <div className="text-center">
                  <p className="text-xl font-bold text-white">{currentSong.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{currentSong.artist}</p>
                </div>

                {currentSong.source && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {sourceIcons[currentSong.source]}
                    <span className="capitalize">{currentSong.source}</span>
                  </div>
                )}

                <div className="w-full max-w-md space-y-2">
                  <div
                    ref={progressRef}
                    className="relative h-1.5 w-full rounded-full bg-white/10 cursor-pointer group"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progressPercent}% - 7px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button onClick={() => setExpanded(true)} className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 pointer-events-none">
                    <FaStepBackward size={16} />
                  </button>
                  <button onClick={prev} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <FaStepBackward size={18} />
                  </button>
                  <button
                    onClick={() => isPlaying ? pause() : play()}
                    className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-shadow"
                  >
                    {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                  </button>
                  <button onClick={next} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <FaStepForward size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 pointer-events-none">
                    <FaStepForward size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors shrink-0">
                    {isMuted || volume === 0 ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                  </button>
                  <div className="flex-1">
                    <Slider
                      value={isMuted ? 0 : volume * 100}
                      onChange={(v) => setVolume(v / 100)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>

                {isPlaying && (
                  <div className="flex items-end gap-1 h-6">
                    {eqBars.map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, h, 4, h * 0.7, 4] }}
                        transition={{ duration: 1 + i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-1 rounded-full bg-gradient-to-t from-purple-500 to-pink-500"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
