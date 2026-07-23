import type { Song } from './song';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  favoriteSongs: Song[];
  favoriteArtist: string;
  theme: 'dark' | 'light';
  createdAt: Date;
  lastActive: Date;
  online: boolean;
  currentRoom: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
