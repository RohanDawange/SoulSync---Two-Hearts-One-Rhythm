export { auth, db, storage, default as app } from './config';
export {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout,
  onAuthChange,
  getCurrentUser,
  getFirebaseIdToken,
} from './auth';
