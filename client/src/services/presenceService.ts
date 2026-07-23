import { doc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from '@/types';

export function setUserOnline(uid: string, online: boolean) {
  return updateDoc(doc(db, 'users', uid), {
    online,
    lastActive: new Date(),
  }).catch(() => {});
}

export function listenUser(uid: string, callback: (user: User | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as User) : null);
  });
}

export function setupPresenceCleanup(uid: string) {
  const handleBeforeUnload = () => {
    setUserOnline(uid, false);
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      navigator.sendBeacon?.('/api/presence/offline', JSON.stringify({ uid }));
    }
  });
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
