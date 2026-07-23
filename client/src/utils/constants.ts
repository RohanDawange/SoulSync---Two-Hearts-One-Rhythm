export const SOCKET_EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
  ROOM_PARTICIPANT_JOINED: 'room:participant-joined',
  ROOM_PARTICIPANT_LEFT: 'room:participant-left',
  ROOM_ERROR: 'room:error',
  PLAYER_PLAY: 'player:play',
  PLAYER_PAUSE: 'player:pause',
  PLAYER_SEEK: 'player:seek',
  PLAYER_NEXT: 'player:next',
  PLAYER_PREV: 'player:prev',
  PLAYER_URL_CHANGE: 'player:url-change',
  PLAYER_TIMESTAMP: 'player:timestamp',
  PLAYER_STATE_CHANGE: 'player:state-change',
  CHAT_SEND: 'chat:send',
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  CALL_ICE_CANDIDATE: 'call:ice-candidate',
  CALL_END: 'call:end',
  CALL_MUTE: 'call:mute',
  REACTION_SEND: 'reaction:send',
  REACTION_RECEIVED: 'reaction:received',
  COUPLE_HUG: 'couple:hug',
  COUPLE_KISS: 'couple:kiss',
  PLAYLIST_ADD: 'playlist:add',
  PLAYLIST_REMOVE: 'playlist:remove',
  PLAYLIST_REORDER: 'playlist:reorder',
  PLAYLIST_UPDATED: 'playlist:updated',
  QUEUE_ADD: 'queue:add',
  QUEUE_REMOVE: 'queue:remove',
  QUEUE_CLEAR: 'queue:clear',
  QUEUE_UPDATED: 'queue:updated',
} as const;

export const MUSIC_SOURCES = [
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: 'FaYoutube' },
  { id: 'spotify', name: 'Spotify', color: '#1DB954', icon: 'FaSpotify' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF7700', icon: 'FaSoundcloud' },
  { id: 'applemusic', name: 'Apple Music', color: '#FA243A', icon: 'FaApple', comingSoon: true },
  { id: 'jiosaavn', name: 'JioSaavn', color: '#2F9E79', icon: 'FaMusic', comingSoon: true },
  { id: 'gaana', name: 'Gaana', color: '#E6422E', icon: 'FaMusic', comingSoon: true },
  { id: 'amazonmusic', name: 'Amazon Music', color: '#FF9900', icon: 'FaAmazon', comingSoon: true },
] as const;

export const REACTIONS = ['heart', 'fire', 'laugh', 'sad', 'love', 'applause'] as const;

export const ROOM_CODE_LENGTH = 6;
export const MAX_PARTICIPANTS = 2;
export const RECONNECT_ATTEMPTS = 5;
export const RECONNECT_DELAY = 2000;
export const HEARTBEAT_INTERVAL = 30000;
export const SYNC_INTERVAL = 5000;
