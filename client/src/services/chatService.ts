import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  doc, updateDoc, where, limit, Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Message } from '@/types';

export async function sendMessage(roomCode: string, msg: {
  senderId: string; senderName: string; senderAvatar: string;
  content: string; type: 'text' | 'image' | 'gif';
}): Promise<void> {
  await addDoc(collection(db, 'rooms', roomCode, 'messages'), {
    ...msg,
    roomCode,
    timestamp: serverTimestamp(),
    seen: false,
  });
}

export function listenMessages(roomCode: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'rooms', roomCode, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    const msgs: Message[] = [];
    snap.forEach((d) => {
      const data = d.data();
      msgs.push({
        id: d.id,
        roomCode: data.roomCode,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        type: data.type,
        timestamp: data.timestamp?.toDate() || new Date(),
        seen: data.seen,
      });
    });
    callback(msgs);
  });
}

export async function markMessageSeen(roomCode: string, messageId: string) {
  await updateDoc(doc(db, 'rooms', roomCode, 'messages', messageId), { seen: true });
}
