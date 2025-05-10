
"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { type User, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation'; // Using localized router
import { useTranslations } from 'next-intl';


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

  useEffect(() => {
    // Handle redirect result after sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          setUser(result.user);
          toast({ 
            title: t('loginSuccessfulTitle'), 
            description: t('loginSuccessfulDescription'), 
            className: "bg-accent text-accent-foreground" 
          });
          router.push('/rag'); // Redirect to RAG page after successful login
        }
        // No explicit else needed here, as onAuthStateChanged will handle user state
      })
      .catch((error) => {
        console.error("Google Redirect Sign-In Error:", error);
        const errorCode = error.code;
        const errorMessage = error.message;
        // Provide more specific error messages if possible
        let displayMessage = errorMessage;
        if (errorCode === 'auth/account-exists-with-different-credential') {
          displayMessage = t('redirectAccountExistsError');
        } else if (errorCode === 'auth/cancelled-popup-request') {
            displayMessage = t('redirectCancelledError');
        } else if (errorCode === 'auth/operation-not-allowed') {
            displayMessage = t('redirectOperationNotAllowedError');
        }

        toast({ 
            title: t('redirectFailedTitle'), 
            description: `${t('redirectFailedDescription')}: ${displayMessage}` , 
            variant: 'destructive' 
        });
      })
      .finally(() => {
        setLoading(false); // Ensure loading is false after attempting redirect result
      });
  }, [router, toast, t]);


  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Using signInWithRedirect instead of signInWithPopup
      await signInWithRedirect(auth, provider);
      // The result is handled by getRedirectResult in the useEffect hook
    } catch (error) {
      console.error("Google Sign-In Initialization Error:", error);
      const errorMessage = error instanceof Error ? error.message : t('loginFailedDescription');
      toast({ 
        title: t('loginFailedTitle'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
      setLoading(false); // Stop loading if redirect initiation fails
    }
  }, [toast, t]);

  const signOutUser = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null); // Explicitly set user to null
      toast({ 
        title: t('loggedOutTitle'), 
        description: t('loggedOutDescription') 
      });
      router.push('/auth/login');
    } catch (error) {
      console.error("Sign Out Error:", error);
      const errorMessage = error instanceof Error ? error.message : t('logoutFailedDescription');
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
