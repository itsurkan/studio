"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, BrainCircuit } from 'lucide-react';

export default function LandingRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) { // Only redirect once auth state is resolved
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [router, user, loading]);

  // Show a loading indicator while determining auth state and redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
      <p className="text-muted-foreground flex items-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading Gnosis.AI...
      </p>
    </div>
  );
}