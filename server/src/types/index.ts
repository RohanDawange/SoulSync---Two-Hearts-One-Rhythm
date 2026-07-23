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

export interface RoomParticipant {
  uid: string;
  displayName: string;
  photoURL: string;
  online: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  source: 'youtube' | 'spotify' | 'soundcloud';
  url: string;
  embedUrl: string;
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

export interface Message {
  id: string;
  roomCode: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'gif';
  timestamp: Date;
  seen: boolean;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  signal: any;
  from: string;
  to: string;
  roomCode: string;
}

export interface ServerToClientEvents {
  'room:joined': (room: Room) => void;
  'room:left': (roomCode: string) => void;
  'room:participant-joined': (participant: RoomParticipant) => void;
  'room:participant-left': (uid: string) => void;
  'room:error': (error: string) => void;
  'player:state-change': (data: { isPlaying: boolean; timestamp: number; song: Song | null }) => void;
  'player:timestamp': (timestamp: number) => void;
  'player:url-change': (song: Song) => void;
  'chat:message': (message: Message) => void;
  'chat:typing': (data: { senderId: string; senderName: string; isTyping: boolean }) => void;
  'presence:online': (uid: string) => void;
  'presence:offline': (uid: string) => void;
  'call:offer': (data: { offer: any; from: string; fromName: string; fromAvatar: string }) => void;
  'call:answer': (data: { answer: any; from: string }) => void;
  'call:ice-candidate': (data: { candidate: any; from: string }) => void;
  'call:end': (data: { from: string }) => void;
  'call:mute': (data: { from: string; muted: boolean }) => void;
  'reaction:received': (data: { type: string; from: string; fromName: string }) => void;
  'couple:hug': (data: { from: string; fromName: string }) => void;
  'couple:kiss': (data: { from: string; fromName: string }) => void;
  'playlist:updated': (playlist: Song[]) => void;
  'queue:updated': (queue: Song[]) => void;
}

export interface ClientToServerEvents {
  'room:create': (callback: (room: Room) => void) => void;
  'room:join': (data: { roomCode: string }, callback: (response: { success: boolean; room?: Room; error?: string }) => void) => void;
  'room:leave': (roomCode: string) => void;
  'player:play': (data: { roomCode: string; timestamp: number }) => void;
  'player:pause': (data: { roomCode: string; timestamp: number }) => void;
  'player:seek': (data: { roomCode: string; timestamp: number }) => void;
  'player:next': (roomCode: string) => void;
  'player:prev': (roomCode: string) => void;
  'player:url-change': (data: { roomCode: string; song: Song }) => void;
  'player:timestamp': (data: { roomCode: string; timestamp: number }) => void;
  'chat:send': (data: { roomCode: string; content: string; type: string }) => void;
  'chat:typing': (data: { roomCode: string; isTyping: boolean }) => void;
  'call:offer': (data: { roomCode: string; offer: any; to: string }) => void;
  'call:answer': (data: { roomCode: string; answer: any; to: string }) => void;
  'call:ice-candidate': (data: { roomCode: string; candidate: any; to: string }) => void;
  'call:end': (data: { roomCode: string; to: string }) => void;
  'call:mute': (data: { roomCode: string; muted: boolean; to: string }) => void;
  'reaction:send': (data: { roomCode: string; type: string }) => void;
  'couple:hug': (data: { roomCode: string }) => void;
  'couple:kiss': (data: { roomCode: string }) => void;
  'playlist:add': (data: { roomCode: string; song: Song }) => void;
  'playlist:remove': (data: { roomCode: string; songId: string }) => void;
  'playlist:reorder': (data: { roomCode: string; playlist: Song[] }) => void;
  'queue:add': (data: { roomCode: string; song: Song }) => void;
  'queue:remove': (data: { roomCode: string; songId: string }) => void;
  'queue:clear': (roomCode: string) => void;
}
