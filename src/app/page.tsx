'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import '../i18n'; // Initialize i18next

export default function LandingPage() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4 space-x-2">
        <Button variant="outline" size="sm" onClick={() => changeLanguage('en')}>English</Button>
        <Button variant="outline" size="sm" onClick={() => changeLanguage('uk')}>Українська</Button>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">{t('greeting')}</CardTitle> {/* Example usage */}
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
