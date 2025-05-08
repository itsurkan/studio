"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BrainCircuit, Loader2 } from "lucide-react"; // Added Loader2 for consistency if needed elsewhere, though not used in button
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
    // No need to check loading here, button is disabled during auth loading
    await signInWithGoogle();
  };

  if (loading || (!loading && user)) {
    // Show a loading state while auth is being checked or if redirecting
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground flex items-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </p>
      </div>
    );
  }

  // If not loading and no user, show the merged landing/login page
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground">Gnosis.AI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Unlock insights from your data. Sign in to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-foreground px-4">
            Upload your documents, ask questions, and get intelligent summaries. 
            Simplify your workflow and discover hidden knowledge.
          </p>
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleGoogleSignIn}
            disabled={loading} // Button disabled while auth operations are in progress
          >
            <Image src="/google-logo.svg" alt="Google logo" width={20} height={20} className="mr-2 bg-white rounded-full p-0.5" data-ai-hint="google logo" />
            Sign In with Google
          </Button>
          {/* Informative text if sign-in is actively being attempted, though button disable handles this mostly */}
          {/* {loading && <p className="text-sm text-muted-foreground">Attempting sign-in...</p>} */}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Gnosis.AI. Secure and Intelligent.</p>
      </footer>
    </div>
  );
}
