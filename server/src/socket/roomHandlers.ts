import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, User } from '../types';
import { createRoom, joinRoom, leaveRoom, getRoom } from '../services/roomService';
import { createOrUpdateUser, setUserRoom } from '../services/userService';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket): void {
  const user = socket.data.user;

  socket.on('room:create', async (callback) => {
    try {
      const appUser = await createOrUpdateUser(user.uid, {
        displayName: user.name,
        email: user.email,
        photoURL: user.picture,
      });

      const room = await createRoom(appUser);
      await setUserRoom(user.uid, room.code);

      socket.join(room.code);
      callback(room);
      io.to(room.code).emit('room:joined', room);
    } catch (error) {
      console.error('room:create error:', error);
      socket.emit('room:error', 'Failed to create room');
    }
  });

  socket.on('room:join', async (data, callback) => {
    try {
      const { roomCode } = data;

      const existingRoom = await getRoom(roomCode);
      if (!existingRoom) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (existingRoom.participants.length >= 2) {
        callback({ success: false, error: 'Room is full' });
        return;
      }

      const appUser = await createOrUpdateUser(user.uid, {
        displayName: user.name,
        email: user.email,
        photoURL: user.picture,
      });

      const room = await joinRoom(roomCode, appUser);
      await setUserRoom(user.uid, roomCode);

      socket.join(roomCode);
      callback({ success: true, room });

      socket.to(roomCode).emit('room:participant-joined', {
        uid: user.uid,
        displayName: user.name,
        photoURL: user.picture,
        online: true,
      });

      io.to(roomCode).emit('room:joined', room);
    } catch (error) {
      console.error('room:join error:', error);
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  socket.on('room:leave', async (roomCode) => {
    try {
      await leaveRoom(roomCode, user.uid);
      await setUserRoom(user.uid, null);

      socket.leave(roomCode);
      socket.emit('room:left', roomCode);

      socket.to(roomCode).emit('room:participant-left', user.uid);

      const room = await getRoom(roomCode);
      if (room) {
        io.to(roomCode).emit('room:joined', room);
      }
    } catch (error) {
      console.error('room:leave error:', error);
      socket.emit('room:error', 'Failed to leave room');
    }
  });
}
