"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { User } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, clientType: string, age?: number, gender?: string, height?: number, weight?: number) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
  email: string,
  password: string,
  displayName: string,
  clientType: string,
  age?: number,
  gender?: string,
  height?: number,
  weight?: number
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email!,
    displayName,
    clientType,      
    age: age ?? null,
    gender: gender ?? null,
    height: height ?? null,
    weight: weight ?? null,
    goalIds: [],     
    activeWorkoutTemplateId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};



  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      const newUser: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || 'User',
        photoURL: userCredential.user.photoURL || undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
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
