import { v4 as uuidv4 } from 'uuid';
import { Room, RoomParticipant, User } from '../types';
import { generateRoomCode } from '../utils/helpers';
import {
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
} from './firestoreService';

const ROOMS_COLLECTION = 'rooms';
const MAX_PARTICIPANTS = 2;

export async function createRoom(user: User): Promise<Room> {
  let code = generateRoomCode();
  let existing = await getDocument<Room>(ROOMS_COLLECTION, code);
  let attempts = 0;
  while (existing && attempts < 10) {
    code = generateRoomCode();
    existing = await getDocument<Room>(ROOMS_COLLECTION, code);
    attempts++;
  }
  if (existing) {
    throw new Error('Unable to generate unique room code. Please try again.');
  }

  const participant: RoomParticipant = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    online: true,
  };

  const room: Room = {
    code,
    createdBy: user.uid,
    participants: [participant],
    createdAt: new Date(),
    currentSong: null,
    isPlaying: false,
    timestamp: 0,
    playlist: [],
    queue: [],
  };

  await setDocument(ROOMS_COLLECTION, code, room);
  return room;
}

export async function joinRoom(roomCode: string, user: User): Promise<Room> {
  const room = await getDocument<Room>(ROOMS_COLLECTION, roomCode);

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.participants.length >= MAX_PARTICIPANTS) {
    throw new Error('Room is full. Maximum 2 participants allowed.');
  }

  if (room.participants.find((p) => p.uid === user.uid)) {
    return room;
  }

  const participant: RoomParticipant = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    online: true,
  };

  const updatedParticipants = [...room.participants, participant];
  await updateDocument(ROOMS_COLLECTION, roomCode, { participants: updatedParticipants });

  return { ...room, participants: updatedParticipants };
}

export async function leaveRoom(roomCode: string, uid: string): Promise<void> {
  const room = await getDocument<Room>(ROOMS_COLLECTION, roomCode);

  if (!room) return;

  const updatedParticipants = room.participants.filter((p) => p.uid !== uid);

  if (updatedParticipants.length === 0) {
    await deleteDocument(ROOMS_COLLECTION, roomCode);
    return;
  }

  await updateDocument(ROOMS_COLLECTION, roomCode, { participants: updatedParticipants });
}

export async function getRoom(roomCode: string): Promise<Room | null> {
  return getDocument<Room>(ROOMS_COLLECTION, roomCode);
}

export async function updateRoom(roomCode: string, data: Partial<Room>): Promise<void> {
  await updateDocument(ROOMS_COLLECTION, roomCode, data);
}

export function isRoomFull(room: Room): boolean {
  return room.participants.length >= MAX_PARTICIPANTS;
}

export function getMaxParticipants(): number {
  return MAX_PARTICIPANTS;
}
