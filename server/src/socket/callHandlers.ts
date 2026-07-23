import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerCallHandlers(io: TypedServer, socket: TypedSocket): void {
  const user = socket.data.user;

  socket.on('call:offer', ({ roomCode, offer, to }) => {
    socket.to(to).emit('call:offer', {
      offer,
      from: user.uid,
      fromName: user.name,
      fromAvatar: user.picture,
    });
  });

  socket.on('call:answer', ({ roomCode, answer, to }) => {
    socket.to(to).emit('call:answer', {
      answer,
      from: user.uid,
    });
  });

  socket.on('call:ice-candidate', ({ roomCode, candidate, to }) => {
    socket.to(to).emit('call:ice-candidate', {
      candidate,
      from: user.uid,
    });
  });

  socket.on('call:end', ({ roomCode, to }) => {
    socket.to(to).emit('call:end', {
      from: user.uid,
    });
  });

  socket.on('call:mute', ({ roomCode, muted, to }) => {
    socket.to(to).emit('call:mute', {
      from: user.uid,
      muted,
    });
  });
}
