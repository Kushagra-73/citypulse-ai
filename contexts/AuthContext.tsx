'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/firebase/config';
import { UserProfile } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updatePointsAndTrust: (pointsDelta: number, trustDelta: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'citypulse_guest_user_v2';
const DEFAULT_GUEST: UserProfile = {
  uid: 'guest_user_101',
  name: 'Aarav Patel',
  email: 'guest@citypulse.ai',
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  trustScore: 75,
  rewardPoints: 45,
  badges: ['First Step'],
  joinedDate: new Date().toISOString(),
  reportsCount: 2,
  isGuest: true
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load User Data helper
  const syncOrCreateUserProfile = async (fbUser: FirebaseUser) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
      } else {
        const newUser: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'Civic Member',
          email: fbUser.email || '',
          photo: fbUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
          trustScore: 80, // Default trust score
          rewardPoints: 10, // Starting bonus
          badges: ['First Step'],
          joinedDate: new Date().toISOString(),
          reportsCount: 0,
        };
        await setDoc(userRef, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error fetching/creating user profile:', error);
      toast.error('Failed to sync profile. Using local profile.');
      // Local fallback
      setUser({
        uid: fbUser.uid,
        name: fbUser.displayName || 'Civic Member',
        email: fbUser.email || '',
        photo: fbUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        trustScore: 80,
        rewardPoints: 10,
        badges: ['First Step'],
        joinedDate: new Date().toISOString(),
        reportsCount: 0,
      });
    }
  };

  useEffect(() => {
    // 1. If Firebase is not configured, check for Guest / Local Mock User session
    if (!isFirebaseConfigured) {
      const cached = localStorage.getItem(GUEST_STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    // 2. Set up Firebase state listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        await syncOrCreateUserProfile(fbUser);
      } else {
        // Fallback to checking local guest session
        const cached = localStorage.getItem(GUEST_STORAGE_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auth Operations
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.success('Firebase auth bypassed! Logging in as Mock Google User.');
      const mockGoogle: UserProfile = {
        uid: 'mock_google_555',
        name: 'Arjun Sharma',
        email: 'arjun.sharma@gmail.com',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        trustScore: 85,
        rewardPoints: 240,
        badges: ['First Step', 'Top Contributor'],
        joinedDate: new Date().toISOString(),
        reportsCount: 12,
      };
      setUser(mockGoogle);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(mockGoogle));
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        toast.success('Signed in with Google');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Google Auth Failed');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.success('Firebase auth bypassed! Logging in as Mock User.');
      const mockUser: UserProfile = {
        uid: 'mock_email_777',
        name: email.split('@')[0],
        email: email,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        trustScore: 80,
        rewardPoints: 95,
        badges: ['First Step'],
        joinedDate: new Date().toISOString(),
        reportsCount: 4,
      };
      setUser(mockUser);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(mockUser));
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('Successfully Signed In');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Sign In Failed');
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.success('Firebase auth bypassed! Created Mock User.');
      const mockUser: UserProfile = {
        uid: 'mock_email_' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        trustScore: 80,
        rewardPoints: 10,
        badges: ['First Step'],
        joinedDate: new Date().toISOString(),
        reportsCount: 0,
      };
      setUser(mockUser);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(mockUser));
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      await syncOrCreateUserProfile(cred.user);
      toast.success('Account Created successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Sign Up Failed');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.success('Mock Password Reset Email Sent to: ' + email);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Password Reset Failed');
      throw error;
    }
  };

  const loginAsGuest = () => {
    setUser(DEFAULT_GUEST);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST));
    toast.success('LoggedIn as Guest');
  };

  const logout = async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      toast.success('Signed Out');
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      toast.success('Signed Out');
    } catch (error: any) {
      console.error(error);
      toast.error('Logout failed');
    }
  };

  // Helper function to update points/trust score in real-time on UI actions
  const updatePointsAndTrust = (pointsDelta: number, trustDelta: number) => {
    if (!user) return;
    const updated = {
      ...user,
      rewardPoints: Math.max(0, user.rewardPoints + pointsDelta),
      trustScore: Math.min(100, Math.max(0, user.trustScore + trustDelta)),
    };
    setUser(updated);

    if (user.isGuest || !isFirebaseConfigured) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    } else if (db) {
      // Sync async to Firestore
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        rewardPoints: updated.rewardPoints,
        trustScore: updated.trustScore
      }, { merge: true }).catch(err => console.error("Error updating user stats: ", err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        resetPassword,
        loginAsGuest,
        logout,
        updatePointsAndTrust,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
