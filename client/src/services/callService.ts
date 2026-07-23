import {
  collection, addDoc, query, where, onSnapshot, orderBy, Timestamp, or
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface CallSignal {
  id?: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'end' | 'mute';
  from: string;
  fromName?: string;
  fromAvatar?: string;
  to: string;
  data?: any;
  timestamp: Date;
}

export async function sendCallSignal(roomCode: string, signal: Omit<CallSignal, 'timestamp'>): Promise<void> {
  await addDoc(collection(db, 'rooms', roomCode, 'calls'), {
    ...signal,
    timestamp: new Date(),
  });
}

export function listenCallSignals(roomCode: string, uid: string, callback: (signal: CallSignal) => void) {
  const q = query(
    collection(db, 'rooms', roomCode, 'calls'),
    where('to', '==', uid),
    orderBy('timestamp', 'asc')
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
          fromAvatar: data.fromAvatar,
          to: data.to,
          data: data.data,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      }
    });
  });
}
