import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';
import * as firebaseAuth from '@/firebase/auth';
import { connectSocket, disconnectSocket } from '@/socket';
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

const mapFirebaseUser = async (firebaseUser: any): Promise<User | null> => {
  if (!firebaseUser) return null;
  const token = await firebaseUser.getIdToken();
  try {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    uid: firebaseUser.uid,
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        connectSocket(token);
        const user = await mapFirebaseUser(firebaseUser);
        dispatch({ type: 'SET_USER', payload: user as User });
      } else {
        disconnectSocket();
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
      await firebaseAuth.logout();
      toast.success('Goodbye! 💜');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
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
