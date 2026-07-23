import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface Reaction {
  id?: string;
  type: string;
  from: string;
  fromName: string;
  timestamp: Date;
}

export async function sendReaction(roomCode: string, reaction: { type: string; from: string; fromName: string }) {
  await addDoc(collection(db, 'rooms', roomCode, 'reactions'), {
    ...reaction,
    timestamp: new Date(),
  });
}

export function listenReactions(roomCode: string, callback: (reaction: Reaction) => void) {
  const q = query(
    collection(db, 'rooms', roomCode, 'reactions'),
    orderBy('timestamp', 'desc'),
    limit(5)
  );
  return onSnapshot(q, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        callback({
          id: change.doc.id,
          type: data.type,
          from: data.from,
          fromName: data.fromName,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      }
    });
  });
}
