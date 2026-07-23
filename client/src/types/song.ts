export type MusicSource = 'youtube' | 'spotify' | 'soundcloud';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  source: MusicSource;
  url: string;
  embedUrl: string;
}
