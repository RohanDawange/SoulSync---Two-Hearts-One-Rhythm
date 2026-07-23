import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { updateRoom, getRoom } from '../services/roomService';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerPlayerHandlers(io: TypedServer, socket: TypedSocket): void {
  const user = socket.data.user;

  socket.on('player:play', async ({ roomCode, timestamp }) => {
    try {
      socket.to(roomCode).emit('player:state-change', {
        isPlaying: true,
        timestamp,
        song: null,
      });
      await updateRoom(roomCode, { isPlaying: true, timestamp } as any);
    } catch (error) {
      console.error('player:play error:', error);
    }
  });

  socket.on('player:pause', async ({ roomCode, timestamp }) => {
    try {
      socket.to(roomCode).emit('player:state-change', {
        isPlaying: false,
        timestamp,
        song: null,
      });
      await updateRoom(roomCode, { isPlaying: false, timestamp } as any);
    } catch (error) {
      console.error('player:pause error:', error);
    }
  });

  socket.on('player:seek', async ({ roomCode, timestamp }) => {
    try {
      socket.to(roomCode).emit('player:state-change', {
        isPlaying: true,
        timestamp,
        song: null,
      });
      await updateRoom(roomCode, { timestamp } as any);
    } catch (error) {
      console.error('player:seek error:', error);
    }
  });

  socket.on('player:next', async (roomCode) => {
    try {
      socket.to(roomCode).emit('player:state-change', {
        isPlaying: true,
        timestamp: 0,
        song: null,
      });
    } catch (error) {
      console.error('player:next error:', error);
    }
  });

  socket.on('player:prev', async (roomCode) => {
    try {
      socket.to(roomCode).emit('player:state-change', {
        isPlaying: true,
        timestamp: 0,
        song: null,
      });
    } catch (error) {
      console.error('player:prev error:', error);
    }
  });

  socket.on('player:url-change', async ({ roomCode, song }) => {
    try {
      io.to(roomCode).emit('player:url-change', song);
      await updateRoom(roomCode, {
        currentSong: song,
        isPlaying: true,
        timestamp: 0,
      } as any);
    } catch (error) {
      console.error('player:url-change error:', error);
    }
  });

  socket.on('player:timestamp', async ({ roomCode, timestamp }) => {
    try {
      socket.to(roomCode).emit('player:timestamp', timestamp);
      await updateRoom(roomCode, { timestamp } as any);
    } catch (error) {
      console.error('player:timestamp error:', error);
    }
  });
}
