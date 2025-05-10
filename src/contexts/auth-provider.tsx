
"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback, useRef } from 'react'; // Added useRef
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
  const [loading, setLoading] = useState(true); // For initial auth state check
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('AuthContext');
  const redirectHandlerCalled = useRef(false); // To ensure redirect logic runs once

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Primary signal that auth state is resolved
    });
    return () => unsubscribe();
  }, []);

  // Handle redirect result
  useEffect(() => {
    // Wait for initial auth loading to complete AND ensure this runs only once.
    if (loading || redirectHandlerCalled.current) {
      return;
    }

    const handleRedirect = async () => {
      redirectHandlerCalled.current = true; // Mark as attempted/called
      // Do not set global loading state here to prevent AppLayout re-renders of children
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // setUser(result.user); // onAuthStateChanged will likely handle this.
                                // If user info from result is richer/sooner, this can be reconsidered.
          toast({ 
            title: t('loginSuccessfulTitle'), 
            description: t('loginSuccessfulDescription'), 
            className: "bg-accent text-accent-foreground" 
          });
          router.push('/rag'); // Redirect to RAG page
        }
      } catch (error) {
        console.error("Google Sign-In Redirect Error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process sign-in redirect.';
        toast({ 
          title: t('loginFailedTitle'), 
          description: errorMessage, 
          variant: 'destructive' 
        });
      }
      // No setLoading(false) here as we didn't set global loading for this operation
    };
    
    handleRedirect();

  }, [loading, router, t, toast]); // `loading` ensures we wait for onAuthStateChanged

  const signInWithGoogle = useCallback(async () => {
    // setLoading(true); // This might be too broad; signInWithRedirect handles its own UI transition
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google.';
      toast({ 
        title: t('loginFailedTitle'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
      // setLoading(false); // Only if we set it true at the start of this specific action
    }
  }, [toast, t]); // Removed setLoading from signInWithGoogle for redirect flow

  const signOutUser = useCallback(async () => {
    setLoading(true); // Appropriate here as it's a definite auth state change initiation
    try {
      await firebaseSignOut(auth);
      // User state will be set to null by onAuthStateChanged, triggering loading=false
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
      setLoading(false); // Ensure loading is false on error
    }
  }, [toast, router, t]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

