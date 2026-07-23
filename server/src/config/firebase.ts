import admin from 'firebase-admin';
import { config } from './env';

const firebaseApp = (config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY)
  ? admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY,
      }),
    })
  : admin.initializeApp({
      projectId: config.FIREBASE_PROJECT_ID,
    });

const db = admin.firestore();

export { admin, db };
