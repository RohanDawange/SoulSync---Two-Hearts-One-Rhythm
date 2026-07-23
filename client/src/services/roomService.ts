import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot,
  collection, query, orderBy, limit, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Room, RoomParticipant, Song } from '@/types';
import { generateRoomCode } from '@/utils/generateRoomCode';

export async function createRoom(user: { uid: string; displayName: string; photoURL: string }): Promise<Room> {
  let code: string;
  let attempts = 0;
  while (attempts < 10) {
    code = generateRoomCode();
    const existing = await getDoc(doc(db, 'rooms', code));
    if (!existing.exists()) break;
    attempts++;
  }

  const room: Room = {
    code: code!,
    createdBy: user.uid,
    participants: [{ uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, online: true }],
    createdAt: new Date(),
    currentSong: null,
    isPlaying: false,
    timestamp: 0,
    playlist: [],
    queue: [],
  };

  await setDoc(doc(db, 'rooms', code!), room);
  return room;
}

export async function joinRoom(roomCode: string, user: { uid: string; displayName: string; photoURL: string }): Promise<Room> {
  const snap = await getDoc(doc(db, 'rooms', roomCode));
  if (!snap.exists()) throw new Error('Room not found');

  const room = snap.data() as Room;
  if (room.participants.length >= 2) throw new Error('Room is full');
  if (room.participants.some(p => p.uid === user.uid)) throw new Error('Already in room');

  room.participants.push({ uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, online: true });
  await updateDoc(doc(db, 'rooms', roomCode), { participants: room.participants });
  return { ...room, participants: room.participants };
}

export async function leaveRoom(roomCode: string, uid: string): Promise<void> {
  const snap = await getDoc(doc(db, 'rooms', roomCode));
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  const participants = room.participants.filter(p => p.uid !== uid);

  if (participants.length === 0) {
    await deleteDoc(doc(db, 'rooms', roomCode));
  } else {
    await updateDoc(doc(db, 'rooms', roomCode), { participants });
  }
}

export async function getRoom(roomCode: string): Promise<Room | null> {
  const snap = await getDoc(doc(db, 'rooms', roomCode));
  return snap.exists() ? (snap.data() as Room) : null;
}

export function listenRoom(roomCode: string, callback: (room: Room | null) => void) {
  const unsub = onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
    callback(snap.exists() ? (snap.data() as Room) : null);
  });
  return unsub;
}

export async function updatePlayerState(roomCode: string, data: { currentSong?: Song | null; isPlaying?: boolean; timestamp?: number }) {
  await updateDoc(doc(db, 'rooms', roomCode), data);
}

export async function updatePlaylist(roomCode: string, playlist: Song[]) {
  await updateDoc(doc(db, 'rooms', roomCode), { playlist });
}

export async function updateQueue(roomCode: string, queue: Song[]) {
  await updateDoc(doc(db, 'rooms', roomCode), { queue });
}
