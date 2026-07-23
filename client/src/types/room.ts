import type { Song } from './song';

export interface RoomParticipant {
  uid: string;
  displayName: string;
  photoURL: string;
  online: boolean;
  lastActive?: string | Date;
}

export interface Room {
  code: string;
  createdBy: string;
  participants: RoomParticipant[];
  createdAt: Date;
  currentSong: Song | null;
  isPlaying: boolean;
  timestamp: number;
  playlist: Song[];
  queue: Song[];
}
