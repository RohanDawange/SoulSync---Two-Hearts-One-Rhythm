import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';
import * as firebaseAuth from '@/firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'LOGOUT':
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
}

const createOrGetUser = async (firebaseUser: any): Promise<User> => {
  const uid = firebaseUser.uid;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as User;
  }

  const newUser: User = {
    uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'User',
    photoURL: firebaseUser.photoURL || '',
    bio: '',
    favoriteSongs: [],
    favoriteArtist: '',
    theme: 'dark',
    createdAt: new Date(),
    lastActive: new Date(),
    online: true,
    currentRoom: null,
  };

  await setDoc(userRef, newUser);
  return newUser;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const user = await createOrGetUser(firebaseUser);
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await firebaseAuth.loginWithGoogle();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await firebaseAuth.loginWithEmail(email, password);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await firebaseAuth.registerWithEmail(email, password);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  };

  const logout = async () => {
    try {
      if (state.user) {
        await setDoc(doc(db, 'users', state.user.uid), { online: false, lastActive: new Date() }, { merge: true });
      }
      await firebaseAuth.logout();
      toast.success('Goodbye! 💜');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
    if (state.user) {
      setDoc(doc(db, 'users', state.user.uid), data, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, loginWithGoogle, loginWithEmail, registerWithEmail, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
