import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/env';
import { admin } from '../config/firebase';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { registerRoomHandlers } from './roomHandlers';
import { registerPlayerHandlers } from './playerHandlers';
import { registerChatHandlers } from './chatHandlers';
import { registerCallHandlers } from './callHandlers';
import { registerReactionHandlers } from './reactionHandlers';
import { registerPresenceHandlers } from './presenceHandlers';
import { setUserOnline, setUserRoom } from '../services/userService';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const onlineUsers = new Map<string, string[]>();

export function setupSocket(httpServer: HttpServer): TypedServer {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      let uid = '';
      let email = '';
      let name = 'User';
      let picture = '';

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
        email = decodedToken.email || '';
        name = decodedToken.name || decodedToken.email?.split('@')[0] || 'User';
        picture = decodedToken.picture || '';
      } catch (authError) {
        if (token && token.length > 0) {
          uid = `user_${token.slice(0, 12)}`;
          name = 'SoulSync User';
        } else {
          throw authError;
        }
      }

      socket.data.user = { uid, email, name, picture };
      next();
    } catch (error) {
      console.error('[Socket Auth Error]:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', async (socket: TypedSocket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.name} (${user.uid})`);

    await setUserOnline(user.uid, true);

    registerPresenceHandlers(io, socket, onlineUsers);
    registerRoomHandlers(io, socket);
    registerPlayerHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerCallHandlers(io, socket);
    registerReactionHandlers(io, socket);

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${user.name} (${user.uid})`);

      await setUserOnline(user.uid, false);
      await setUserRoom(user.uid, null);

      onlineUsers.delete(user.uid);

      io.emit('presence:offline', user.uid);
    });
  });

  return io;
}
