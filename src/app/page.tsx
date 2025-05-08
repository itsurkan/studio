
"use client"; // Make this a client component to use useAuth

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (loading) return; // Do nothing if still loading auth state
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Gnosis.AI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Unlock insights from your data with the power of AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-foreground">
            Upload your documents, ask questions, and get intelligent summaries. 
            Simplify your workflow and discover hidden knowledge.
          </p>
          <Button size="lg" className="w-full" onClick={handleGetStarted} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Get Started"
            )}
          </Button>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Gnosis.AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
