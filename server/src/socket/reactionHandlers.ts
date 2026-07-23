import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const VALID_REACTIONS = ['hearts', 'fire', 'laugh', 'sad', 'love', 'applause'];

export function registerReactionHandlers(io: TypedServer, socket: TypedSocket): void {
  const user = socket.data.user;

  socket.on('reaction:send', ({ roomCode, type }) => {
    if (!VALID_REACTIONS.includes(type)) return;

    socket.to(roomCode).emit('reaction:received', {
      type,
      from: user.uid,
      fromName: user.name,
    });
  });

  socket.on('couple:hug', ({ roomCode }) => {
    socket.to(roomCode).emit('couple:hug', {
      from: user.uid,
      fromName: user.name,
    });
  });

  socket.on('couple:kiss', ({ roomCode }) => {
    socket.to(roomCode).emit('couple:kiss', {
      from: user.uid,
      fromName: user.name,
    });
  });
}
