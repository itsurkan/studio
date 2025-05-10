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
        const errorCode = (error as any).code;
        // Avoid toasting "auth/no-user-found" or "auth/no-redirect-operation" which are normal if no redirect was pending
        if (errorCode !== 'auth/no-user-found' && errorCode !== 'auth/no-redirect-operation') {
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
    console.log(
      "Attempting Google Sign-In via redirect. " +
      "If you see 'accounts.google.com refused to connect', please ensure: \n" +
      "1. Your current application domain (e.g., from browser URL) is listed in Firebase Console > Authentication > Settings > Authorized domains.\n" +
      "2. The 'Identity Toolkit API' is enabled in your Google Cloud Project.\n" +
      "3. API key restrictions (if any) allow your domain."
    );
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // User will be redirected. Result is handled by the useEffect hook above.
      // setLoading(false) is not needed here as the page will navigate away.
    } catch (error) {
      console.error("Google Sign-In Error (initiating redirect):", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Google Sign-In.';
      toast({
        title: t('loginFailedTitle'),
        description: errorMessage,
        variant: 'destructive'
      });
      setLoading(false); // Set loading false only if initiating redirect fails
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