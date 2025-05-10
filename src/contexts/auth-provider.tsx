"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { type User, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation'; // Use localized router
import { useTranslations } from 'next-intl'; // Import useTranslations


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
  const t = useTranslations('AuthContext'); // Initialize translations

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle the redirect result
  useEffect(() => {
    const handleRedirect = async () => {
      setLoading(true);
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setUser(result.user);
          toast({
            title: t('loginSuccessfulTitle'),
            description: t('loginSuccessfulDescription'),
            className: "bg-accent text-accent-foreground"
          });
          router.push('/dashboard'); // Redirect to dashboard after successful login
        }
      } catch (error) {
        console.error("Google Sign-In Redirect Error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google after redirect.';
        if ((error as any).code !== 'auth/no-user-found') { // Don't toast if it's just no redirect pending
            toast({
                title: t('loginFailedTitle'),
                description: errorMessage,
                variant: 'destructive'
            });
        }
      } finally {
        setLoading(false);
      }
    };
    handleRedirect();
  }, [toast, router, t]);


  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // The user will be redirected, and the result handled by the useEffect hook above.
    } catch (error) {
      console.error("Google Sign-In Error (initiating redirect):", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Google Sign-In.';
      toast({
        title: t('loginFailedTitle'),
        description: errorMessage,
        variant: 'destructive'
      });
      setLoading(false);
    }
  }, [toast, t]);

  const signOutUser = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({
        title: t('loggedOutTitle'),
        description: t('loggedOutDescription')
      });
      router.push('/auth/login');
    } catch (error) {
      console.error("Sign Out Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out.';
      toast({
        title: t('logoutFailedTitle'),
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast, router, t]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
