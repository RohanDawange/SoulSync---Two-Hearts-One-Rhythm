import { User } from '../types';
import { getDocument, setDocument, updateDocument } from './firestoreService';

const USERS_COLLECTION = 'users';

export async function createOrUpdateUser(uid: string, data: Partial<User>): Promise<User> {
  const existing = await getDocument<User>(USERS_COLLECTION, uid);

  if (existing) {
    const updatedData: Partial<User> = {
      ...data,
      lastActive: new Date(),
    };
    await updateDocument(USERS_COLLECTION, uid, updatedData);
    return { ...existing, ...updatedData } as User;
  }

  const newUser: User = {
    uid,
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || '',
    bio: data.bio || '',
    favoriteSongs: data.favoriteSongs || [],
    favoriteArtist: data.favoriteArtist || '',
    theme: data.theme || 'dark',
    createdAt: new Date(),
    lastActive: new Date(),
    online: true,
    currentRoom: data.currentRoom || null,
  };

  await setDocument(USERS_COLLECTION, uid, newUser);
  return newUser;
}

export async function getUser(uid: string): Promise<User | null> {
  return getDocument<User>(USERS_COLLECTION, uid);
}

export async function setUserOnline(uid: string, online: boolean): Promise<void> {
  await updateDocument(USERS_COLLECTION, uid, { online, lastActive: new Date() });
}

export async function setUserRoom(uid: string, roomCode: string | null): Promise<void> {
  await updateDocument(USERS_COLLECTION, uid, { currentRoom: roomCode });
}
