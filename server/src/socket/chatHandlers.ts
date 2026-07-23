import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ClientToServerEvents, ServerToClientEvents, Message } from '../types';
import { setDocument } from '../services/firestoreService';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const MESSAGES_COLLECTION = 'messages';
const MAX_CONTENT_LENGTH = 1000;

export function registerChatHandlers(io: TypedServer, socket: TypedSocket): void {
  const user = socket.data.user;

  socket.on('chat:send', async ({ roomCode, content, type }) => {
    try {
      if (!content || content.trim().length === 0) return;
      if (content.length > MAX_CONTENT_LENGTH) return;

      const validTypes = ['text', 'image', 'gif'];
      const messageType = validTypes.includes(type) ? type : 'text';

      const message: Message = {
        id: uuidv4(),
        roomCode,
        senderId: user.uid,
        senderName: user.name,
        senderAvatar: user.picture,
        content: content.trim(),
        type: messageType as 'text' | 'image' | 'gif',
        timestamp: new Date(),
        seen: false,
      };

      await setDocument(MESSAGES_COLLECTION, message.id, message);
      io.to(roomCode).emit('chat:message', message);
    } catch (error) {
      console.error('chat:send error:', error);
    }
  });

  socket.on('chat:typing', ({ roomCode, isTyping }) => {
    socket.to(roomCode).emit('chat:typing', {
      senderId: user.uid,
      senderName: user.name,
      isTyping,
    });
  });
}
