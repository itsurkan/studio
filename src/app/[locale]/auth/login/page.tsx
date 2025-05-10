"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BrainCircuit, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  if (loading || (!loading && user)) {
    // Show a loading state or redirect if user is already logged in and detected
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground">Welcome to Gnosis.AI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your intelligent document hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Image src="/google-logo.svg" alt="Google logo" width={20} height={20} className="mr-2 bg-white rounded-full p-0.5" data-ai-hint="google logo" />
            Sign In with Google
          </Button>
          {loading && <p className="text-sm text-muted-foreground">Attempting sign-in...</p>}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Gnosis.AI. Secure and Intelligent.</p>
      </footer>
    </div>
  );
}