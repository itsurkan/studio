
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BrainCircuit, Loader2 } from "lucide-react"; 
import { useRouter } from '@/navigation'; // Use localized router
import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/rag"); // Changed from /dashboard to /rag
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  // If loading, or if user is already logged in (and redirect hasn't happened yet), show loading.
  // The redirect logic is now primarily handled by getRedirectResult in AuthProvider
  // and the useEffect above for already authenticated users.
  // We still want to show loading if signInWithGoogle has been initiated and is processing.
  if (loading) { 
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
  
  // If user is already present and we are not loading, this page shouldn't be shown
  // as the useEffect above should have redirected. But as a fallback/safety:
  if (!loading && user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground flex items-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t('redirecting')} {/* Or some other appropriate message */}
        </p>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground">{t('title')}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-foreground px-4">
            {t('intro')}
          </p>
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleGoogleSignIn}
            disabled={loading} 
          >
            <Image src="/google-logo.svg" alt="Google logo" width={20} height={20} className="mr-2 bg-white rounded-full p-0.5" data-ai-hint="google logo" />
            {t('signInWithGoogle')}
          </Button>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>{t('footer', {year: new Date().getFullYear()})}</p>
      </footer>
    </div>
  );
}

