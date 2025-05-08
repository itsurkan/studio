"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileList } from "@/components/file-list";
import { useFiles } from "@/contexts/file-provider";
import { ragBasedQuery, type RagBasedQueryInput, type RagBasedQueryOutput } from "@/ai/flows/rag-based-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquarePlus, AlertTriangle, Info, Download, Copy } from "lucide-react";
import type { AppFile, OutputFormat } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

export default function RagPage() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("paragraphs");
  const [ragResult, setRagResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { files: allUploadedFiles } = useFiles();
  const { toast } = useToast();

  const selectedFile = allUploadedFiles.find(f => f.id === selectedFileId);

  const handleQuery = async () => {
    if (!selectedFile) {
      toast({ title: "No File Selected", description: "Please select a file to query.", variant: "default" });
      return;
    }
    if (!query.trim()) {
      toast({ title: "Empty Query", description: "Please enter a question or request.", variant: "default" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRagResult(null);

    try {
      const ragInput: RagBasedQueryInput = {
        query,
        documentContent: selectedFile.content,
        outputFormat,
      };
      
      const result: RagBasedQueryOutput = await ragBasedQuery(ragInput);
      setRagResult(result.answer);
      toast({
        title: "Query Successful",
        description: "AI has generated a response.",
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });

    } catch (err) {
      console.error("RAG query error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during RAG processing.";
      setError(errorMessage);
      toast({
        title: "Query Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (ragResult) {
      navigator.clipboard.writeText(ragResult)
        .then(() => toast({ title: "Copied!", description: "Result copied to clipboard.", className: "bg-accent text-accent-foreground" }))
        .catch(err => toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" }));
    }
  };

  const handleDownloadResult = () => {
    if (ragResult && selectedFile) {
      const blob = new Blob([ragResult], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GnosisAI_Result_${selectedFile.name.replace(/\.[^/.]+$/, "") || 'output'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ask Your Data (RAG)</h1>
        <p className="text-muted-foreground">Get answers and summaries from your selected document.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-md sticky top-24">
            <CardHeader>
              <CardTitle>Select a File</CardTitle>
              <CardDescription>Choose a document to query.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileList 
                onFileSelect={setSelectedFileId} 
                selectedFileId={selectedFileId} 
                showActions={false}
                maxHeight="max-h-[calc(100vh-20rem)]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Ask a Question or Request a Summary</CardTitle>
              <CardDescription>
                Ensure you have selected a file first. Example: "Summarize this document." or "What are the key financial figures?"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleQuery(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rag-query">Your Query</Label>
                  <Textarea
                    id="rag-query"
                    placeholder="Type your question or summarization request here..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                    className="text-base"
                    disabled={isLoading || !selectedFile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select
                    value={outputFormat}
                    onValueChange={(value: OutputFormat) => setOutputFormat(value)}
                    disabled={isLoading || !selectedFile}
                  >
                    <SelectTrigger id="output-format" className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraphs</SelectItem>
                      <SelectItem value="bullets">Bullet Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !selectedFile}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                  )}
                  Get Answer
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
          
          {!selectedFile && !isLoading && (
             <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Select a File</AlertTitle>
                <AlertDescription>
                  Please select a file from the list on the left to start asking questions.
                </AlertDescription>
              </Alert>
          )}

          {ragResult && (
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>AI Generated Response</CardTitle>
                  <CardDescription>For file: {selectedFile?.name}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={handleCopyResult} title="Copy result">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDownloadResult} title="Download result">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-96 w-full rounded-md border p-4 bg-muted/50">
                  {outputFormat === "bullets" ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {ragResult.split('\n').map((item, index) => item.trim() && <li key={index}>{item.replace(/^- /,'').trim()}</li>)}
                    </ul>
                  ) : (
                    <div className="whitespace-pre-wrap space-y-2">
                      {ragResult.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
