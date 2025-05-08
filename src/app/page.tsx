
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
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
          <Link href="/dashboard" legacyBehavior>
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Gnosis.AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
