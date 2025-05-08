
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, BrainCircuit } from 'lucide-react';
import { useRouter } from '@/navigation'; // Use localized router
import { useTranslations } from 'next-intl';

export default function LandingRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const t = useTranslations('LandingRedirectPage');

  useEffect(() => {
    if (!loading) { 
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [router, user, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
      <p className="text-muted-foreground flex items-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t('loading')}
      </p>
    </div>
  );
}
