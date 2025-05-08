
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
import type { OutputFormat } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function RagPage() {
  const t = useTranslations('RagPage');
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
      toast({ title: t('toastNoFileSelectedTitle'), description: t('toastNoFileSelectedDescription'), variant: "default" });
      return;
    }
    if (!query.trim()) {
      toast({ title: t('toastEmptyQueryTitle'), description: t('toastEmptyQueryDescription'), variant: "default" });
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
        title: t('toastQuerySuccessfulTitle'),
        description: t('toastQuerySuccessfulDescription'),
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });

    } catch (err) {
      console.error("RAG query error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during RAG processing.";
      setError(errorMessage);
      toast({
        title: t('toastQueryErrorTitle'),
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
        .then(() => toast({ title: t('toastCopiedTitle'), description: t('toastCopiedDescription'), className: "bg-accent text-accent-foreground" }))
        .catch(err => toast({ title: t('toastCopyFailedTitle'), description: t('toastCopyFailedDescription'), variant: "destructive" }));
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-md sticky top-24">
            <CardHeader>
              <CardTitle>{t('selectFileTitle')}</CardTitle>
              <CardDescription>{t('selectFileDescription')}</CardDescription>
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
              <CardTitle>{t('askQuestionTitle')}</CardTitle>
              <CardDescription>{t('askQuestionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleQuery(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rag-query">{t('yourQueryLabel')}</Label>
                  <Textarea
                    id="rag-query"
                    placeholder={t('queryPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                    className="text-base"
                    disabled={isLoading || !selectedFile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output-format">{t('outputFormatLabel')}</Label>
                  <Select
                    value={outputFormat}
                    onValueChange={(value: OutputFormat) => setOutputFormat(value)}
                    disabled={isLoading || !selectedFile}
                  >
                    <SelectTrigger id="output-format" className="w-full sm:w-[180px]">
                      <SelectValue placeholder={t('outputFormatPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">{t('formatParagraphs')}</SelectItem>
                      <SelectItem value="bullets">{t('formatBullets')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !selectedFile}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                  )}
                  {t('getAnswer')}
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
          
          {!selectedFile && !isLoading && (
             <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>{t('selectAFileAlertTitle')}</AlertTitle>
                <AlertDescription>
                  {t('selectAFileAlertDescription')}
                </AlertDescription>
              </Alert>
          )}

          {ragResult && (
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('aiResponseTitle')}</CardTitle>
                  <CardDescription>{t('aiResponseForFile', {fileName: selectedFile?.name})}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={handleCopyResult} title={t('copyResult')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDownloadResult} title={t('downloadResult')}>
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
