import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

function serializeDates(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return Timestamp.fromDate(data);
  if (Array.isArray(data)) return data.map(serializeDates);
  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeDates(value);
    }
    return result;
  }
  return data;
}

function deserializeDates(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Timestamp) return data.toDate();
  if (Array.isArray(data)) return data.map(deserializeDates);
  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = deserializeDates(value);
    }
    return result;
  }
  return data;
}

const inMemoryStore = new Map<string, Map<string, any>>();

function getMemoryCollection(col: string) {
  if (!inMemoryStore.has(col)) {
    inMemoryStore.set(col, new Map());
  }
  return inMemoryStore.get(col)!;
}

export async function getDocument<T = any>(collection: string, id: string): Promise<T | null> {
  try {
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...deserializeDates(doc.data()) } as T;
  } catch (error) {
    const memCol = getMemoryCollection(collection);
    const item = memCol.get(id);
    return item ? ({ id, ...item } as T) : null;
  }
}

export async function setDocument<T = any>(collection: string, id: string, data: T): Promise<void> {
  const memCol = getMemoryCollection(collection);
  memCol.set(id, { ...(memCol.get(id) || {}), ...data });
  try {
    await db.collection(collection).doc(id).set(serializeDates(data), { merge: true });
  } catch (error) {
    // Fallback to in-memory store when Firestore is unconfigured or offline
  }
}

export async function updateDocument<T = any>(collection: string, id: string, data: Partial<T>): Promise<void> {
  const memCol = getMemoryCollection(collection);
  memCol.set(id, { ...(memCol.get(id) || {}), ...data });
  try {
    await db.collection(collection).doc(id).update(serializeDates(data));
  } catch (error) {
    // Fallback to in-memory store when Firestore is unconfigured or offline
  }
}

export async function deleteDocument(collection: string, id: string): Promise<void> {
  const memCol = getMemoryCollection(collection);
  memCol.delete(id);
  try {
    await db.collection(collection).doc(id).delete();
  } catch (error) {
    // Fallback to in-memory store when Firestore is unconfigured or offline
  }
}

export async function queryDocuments<T = any>(
  collection: string,
  field: string,
  operator: FirebaseFirestore.WhereFilterOp,
  value: any,
  limit: number = 10
): Promise<T[]> {
  try {
    const snapshot = await db
      .collection(collection)
      .where(field, operator, value)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...deserializeDates(doc.data()) } as T));
  } catch (error) {
    const memCol = getMemoryCollection(collection);
    const items = Array.from(memCol.values());
    return items.filter((item) => item[field] === value).slice(0, limit) as T[];
  }
}

export async function getCollection<T = any>(collection: string): Promise<T[]> {
  try {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...deserializeDates(doc.data()) } as T));
  } catch (error) {
    const memCol = getMemoryCollection(collection);
    return Array.from(memCol.values()) as T[];
  }
}
