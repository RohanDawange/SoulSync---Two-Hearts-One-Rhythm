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
