
"use client"; // This layout needs to be a client component for auth checks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppProviders } from "@/contexts/app-providers";
import { BrainCircuit, Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <BrainCircuit className="w-12 h-12 text-primary animate-pulse mb-4" />
        <p className="text-lg text-muted-foreground flex items-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading application...
        </p>
      </div>
    );
  }

  return (
    <AppProviders>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 md:ml-64 pt-4 px-4 md:px-8 pb-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
