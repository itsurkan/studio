
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileList } from "@/components/file-list";
import { useFiles } from "@/contexts/file-provider";
import { semanticSearch, type SemanticSearchInput, type SemanticSearchOutput } from "@/ai/flows/semantic-search";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SearchIcon, AlertTriangle, Info } from "lucide-react";
import type { AppFile } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";


export default function SemanticSearchPage() {
  const t = useTranslations('SemanticSearchPage');
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AppFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { files: allUploadedFiles } = useFiles();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({ title: t('toastEmptyQueryTitle'), description: t('toastEmptyQueryDescription'), variant: "default" });
      return;
    }
    if (allUploadedFiles.length === 0) {
      toast({ title: t('toastNoFilesTitle'), description: t('toastNoFilesDescription'), variant: "default" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const searchInput: SemanticSearchInput = {
        query,
        files: allUploadedFiles.map(f => ({ name: f.name, data: f.content })),
      };
      
      const result: SemanticSearchOutput = await semanticSearch(searchInput);
      
      const relevantAppFiles = allUploadedFiles.filter(appFile => 
        result.relevantFiles.includes(appFile.name)
      );

      setSearchResults(relevantAppFiles);

      if (relevantAppFiles.length === 0) {
        toast({
          title: t('toastNoResultsTitle'),
          description: t('toastNoResultsDescription'),
          variant: "default",
        });
      } else {
         toast({
          title: t('toastSearchCompleteTitle'),
          description: t('toastSearchCompleteDescription', {count: relevantAppFiles.length}),
          variant: "default",
          className: "bg-accent text-accent-foreground"
        });
      }

    } catch (err) {
      console.error("Semantic search error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during search.";
      setError(errorMessage);
      toast({
        title: t('toastSearchErrorTitle'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-md sticky top-24"> 
            <CardHeader>
              <CardTitle>{t('yourFilesTitle')}</CardTitle>
              <CardDescription>{t('yourFilesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FileList showActions={false} maxHeight="max-h-[calc(100vh-20rem)]" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('enterQueryTitle')}</CardTitle>
              <CardDescription>{t('enterQueryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
                <Input
                  type="text"
                  placeholder={t('queryPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-base"
                  disabled={isLoading}
                />
                <Button type="submit" className="w-full" disabled={isLoading || allUploadedFiles.length === 0}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="mr-2 h-4 w-4" />
                  )}
                  {t('searchButton')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          { !isLoading && searchResults.length === 0 && query && !error && (
             <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>{t('noMatchesAlertTitle')}</AlertTitle>
              <AlertDescription>
                {t('noMatchesAlertDescription', {query})}
              </AlertDescription>
            </Alert>
          )}

          {searchResults.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>{t('searchResultsTitle')}</CardTitle>
                <CardDescription>{t('searchResultsDescription', {query})}</CardDescription>
              </CardHeader>
              <CardContent>
                 <FileList files={searchResults} showActions={true} maxHeight="max-h-96" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
