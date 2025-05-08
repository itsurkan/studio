"use client";

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";


export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AppFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { files: allUploadedFiles } = useFiles();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({ title: "Empty Query", description: "Please enter a search query.", variant: "default" });
      return;
    }
    if (allUploadedFiles.length === 0) {
      toast({ title: "No Files", description: "Please upload some files before searching.", variant: "default" });
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
      
      // This is a client-side call to a server action.
      const result: SemanticSearchOutput = await semanticSearch(searchInput);
      
      const relevantAppFiles = allUploadedFiles.filter(appFile => 
        result.relevantFiles.includes(appFile.name)
      );

      setSearchResults(relevantAppFiles);

      if (relevantAppFiles.length === 0) {
        toast({
          title: "No Results",
          description: "No files matched your query.",
          variant: "default",
        });
      } else {
         toast({
          title: "Search Complete",
          description: `Found ${relevantAppFiles.length} relevant file(s).`,
          variant: "default",
          className: "bg-accent text-accent-foreground"
        });
      }

    } catch (err) {
      console.error("Semantic search error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during search.";
      setError(errorMessage);
      toast({
        title: "Search Error",
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Semantic Search</h1>
        <p className="text-muted-foreground">Find information across your documents using natural language.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-md sticky top-24"> {/* Sticky for better UX on scroll */}
            <CardHeader>
              <CardTitle>Your Files</CardTitle>
              <CardDescription>Files available for searching.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileList showActions={false} maxHeight="max-h-[calc(100vh-20rem)]" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Enter Your Search Query</CardTitle>
              <CardDescription>E.g., "Find my Q1 report" or "details about project X"</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Type your search query here..."
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
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          { !isLoading && searchResults.length === 0 && query && !error && (
             <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>No Matches Found</AlertTitle>
              <AlertDescription>
                Your search for "{query}" did not return any relevant files. Try refining your query or check your uploaded documents.
              </AlertDescription>
            </Alert>
          )}

          {searchResults.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>Files matching your query "{query}"</CardDescription>
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
