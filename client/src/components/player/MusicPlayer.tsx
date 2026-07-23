import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAdd } from 'react-icons/io5';
import { usePlayer } from '@/context/PlayerContext';
import { useRoom } from '@/context/RoomContext';
import { Song, MusicSource } from '@/types';
import { extractYouTubeId, extractSpotifyId } from '@/utils/validators';
import { getEmbedUrl } from '@/utils';
import AlbumArt from './AlbumArt';
import SongInfo from './SongInfo';
import ProgressBar from './ProgressBar';
import Controls from './Controls';
import VolumeSlider from './VolumeSlider';
import Equalizer from './Equalizer';
import SourceSelector from './SourceSelector';
import YouTubeEmbed from './YouTubeEmbed';
import SpotifyEmbed from './SpotifyEmbed';
import SoundCloudEmbed from './SoundCloudEmbed';
import Button from '@/components/ui/Button';

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration,
    volume, isMuted, shuffle, repeat,
    play, pause, seek, setVolume, toggleMute,
    next, prev, toggleShuffle, toggleRepeat, setCurrentTime, changeSong,
  } = usePlayer();

  const { currentRoom } = useRoom();
  const playlist = currentRoom?.playlist || [];
  const [showSourceSelector, setShowSourceSelector] = useState(!currentSong);

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, [setCurrentTime]);

  const handleSourceLoad = useCallback((source: MusicSource, url: string) => {
    const id = source === 'youtube' ? extractYouTubeId(url)
      : source === 'spotify' ? extractSpotifyId(url)
      : url;

    if (!id) return;

    const song: Song = {
      id: `${source}-${id}`,
      title: url,
      artist: source === 'youtube' ? 'YouTube' : source === 'spotify' ? 'Spotify' : 'SoundCloud',
      albumArt: '',
      duration: 0,
      source,
      url,
      embedUrl: getEmbedUrl(source, url),
    };
    changeSong(song);
    setShowSourceSelector(false);
  }, [changeSong]);

  const videoId = currentSong?.source === 'youtube' && currentSong?.url
    ? extractYouTubeId(currentSong.url) : null;

  const spotifyTrackId = currentSong?.source === 'spotify' && currentSong?.url
    ? extractSpotifyId(currentSong.url) : null;

  const soundCloudUrl = currentSong?.source === 'soundcloud' && currentSong?.url
    ? currentSong.url : null;

  return (
    <div className="w-full">
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-accent-600/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {currentSong ? (
            <>
              <AlbumArt src={currentSong.albumArt} title={currentSong.title} size="xl" isPlaying={isPlaying} />

              <div className="w-full text-center">
                <SongInfo song={currentSong} showSource />
              </div>

              <div className="w-full max-w-lg space-y-2">
                <ProgressBar
                  currentTime={currentTime}
                  duration={currentSong.duration || duration}
                  onSeek={handleSeek}
                />
              </div>

              <div className="w-full max-w-md">
                <Controls
                  isPlaying={isPlaying}
                  onPlay={play}
                  onPause={pause}
                  onNext={next}
                  onPrev={prev}
                  onShuffle={toggleShuffle}
                  onRepeat={toggleRepeat}
                  shuffle={shuffle}
                  repeat={repeat}
                />
              </div>

              <div className="flex items-center justify-between w-full max-w-md pt-2">
                <div className="flex items-center gap-1">
                  {isPlaying && <Equalizer isPlaying={isPlaying} size="sm" />}
                </div>
                <VolumeSlider
                  volume={volume}
                  onVolumeChange={setVolume}
                  muted={isMuted}
                  onMuteToggle={toggleMute}
                />
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<IoAdd />}
                onClick={() => setShowSourceSelector(!showSourceSelector)}
              >
                {showSourceSelector ? 'Hide' : 'Add to Playlist'}
              </Button>
            </>
          ) : (
            <div className="w-full py-4">
              <h3 className="text-lg font-semibold text-white text-center mb-4">Add a Song</h3>
              <SourceSelector onLoad={handleSourceLoad} />
            </div>
          )}

          <AnimatePresence>
            {currentSong && showSourceSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-lg overflow-hidden"
              >
                <div className="border-t border-white/10 pt-4">
                  <SourceSelector onLoad={handleSourceLoad} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {videoId && (
        <YouTubeEmbed
          videoId={videoId}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
        />
      )}

      {spotifyTrackId && (
        <SpotifyEmbed
          trackId={spotifyTrackId}
          isPlaying={isPlaying}
          onReady={() => {}}
        />
      )}

      {soundCloudUrl && (
        <SoundCloudEmbed
          trackId={soundCloudUrl}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
        />
      )}
    </div>
  );
}
