"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { type User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: 'Login Successful', description: 'Welcome back!', className: "bg-accent text-accent-foreground" });
      router.push('/dashboard');
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google.';
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  }, [toast, router]);

  const signOutUser = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/auth/login');
    } catch (error) {
      console.error("Sign Out Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out.';
      toast({ title: 'Logout Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, router]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}