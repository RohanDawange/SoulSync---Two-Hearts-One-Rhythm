import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { setUserOnline, setUserRoom } from '../services/userService';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerPresenceHandlers(
  io: TypedServer,
  socket: TypedSocket,
  onlineUsers: Map<string, string[]>
): void {
  const user = socket.data.user;

  onlineUsers.set(user.uid, []);
  io.emit('presence:online', user.uid);

  socket.on('room:create', async (callback) => {
    const rooms = onlineUsers.get(user.uid) || [];
    // The actual room creation logic is in roomHandlers
    // Here we just track that the user is in a room
  });

  socket.on('room:join', async (data, callback) => {
    const rooms = onlineUsers.get(user.uid) || [];
    if (!rooms.includes(data.roomCode)) {
      rooms.push(data.roomCode);
      onlineUsers.set(user.uid, rooms);
    }
  });

  socket.on('room:leave', async (roomCode) => {
    const rooms = onlineUsers.get(user.uid) || [];
    const updated = rooms.filter((r) => r !== roomCode);
    onlineUsers.set(user.uid, updated);
  });
}
