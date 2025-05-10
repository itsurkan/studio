
"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileList } from "@/components/file-list";
import { useFiles } from "@/contexts/file-provider";
import { ragBasedQuery, type RagBasedQueryInput, type RagBasedQueryOutput } from "@/ai/flows/rag-based-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Info, Send, Mic, User, BrainCircuit, StopCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { ModelSelector, defaultModelId } from "@/components/model-selector";
import type { AppFile } from "@/lib/types";


interface ChatMessageItem {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string; 
  isLoading?: boolean;
  avatar?: string;
  name?: string;
  modelUsed?: string;
}

export default function RagPage() {
  const t = useTranslations('RagPage');
  const commonT = useTranslations('Common');
  const { user } = useAuth();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>(defaultModelId);

  const { files: allUploadedFiles } = useFiles();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const locale = useLocale();

  const selectedFile: AppFile | undefined | null = selectedFileId ? allUploadedFiles.find(file => file.id === selectedFileId) : null;


  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setHasMicPermission(false);
      toast({
        title: t('speechRecognitionNotSupportedTitle'),
        description: t('speechRecognitionNotSupportedDescription'),
        variant: 'default',
        duration: 7000,
      });
      return;
    }

    const checkAndRequestMicPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasMicPermission(true);
        } catch (err) {
            console.error("Microphone access error:", err);
            setHasMicPermission(false);
            if ((err as Error).name === 'NotAllowedError' || (err as Error).name === 'PermissionDeniedError') {
                 toast({
                    title: t('micAccessDeniedTitle'),
                    description: t('micAccessDeniedDescription'),
                    variant: 'destructive',
                 });
            } else {
                 toast({
                    title: t('micAccessErrorTitle'),
                    description: (err as Error).message,
                    variant: 'destructive',
                 });
            }
        }
    };
    
    if (hasMicPermission === null) { 
        checkAndRequestMicPermission();
    }
  }, [hasMicPermission, t, toast]);

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onend = null;
      }
    };
  }, []);


  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableView) {
        scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    // Clear chat when selected file changes
    setChatMessages([]);
    setError(null);
    setQuery(""); 
  }, [selectedFileId]);

  const handleSendMessage = async () => {
    if (!query.trim()) {
      return;
    }

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      avatar: user?.photoURL || undefined,
      name: user?.displayName || commonT('you'),
    };
    setChatMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setIsLoading(true);
    setError(null);
    
    const aiLoadingMessageId = `ai-loading-${Date.now()}`;
    const currentModelName = selectedModelId.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || selectedModelId;
    setChatMessages(prev => [...prev, { 
      id: aiLoadingMessageId, 
      role: 'ai', 
      content: '', 
      isLoading: true, 
      name: "Gnosis.AI",
      modelUsed: currentModelName
    }]);
    scrollToBottom();

    try {
      const ragInput: RagBasedQueryInput = {
        query: currentQuery,
        documentContent: selectedFile ? selectedFile.content : undefined,
        outputFormat: "paragraphs", 
        modelId: selectedModelId,
      };
      
      const result: RagBasedQueryOutput = await ragBasedQuery(ragInput);
      
      const aiResponseMessage: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: result.answer,
        name: "Gnosis.AI",
        timestamp: currentModelName 
      };
      setChatMessages(prev => prev.filter(msg => msg.id !== aiLoadingMessageId).concat(aiResponseMessage));

    } catch (err) {
      console.error("RAG query error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during RAG processing.";
      setError(errorMessage); 
      setChatMessages(prev => prev.filter(msg => msg.id !== aiLoadingMessageId).concat({
        id: `ai-error-${Date.now()}`,
        role: 'ai',
        content: `${t('toastQueryErrorTitle')}: ${errorMessage}`,
        name: "Gnosis.AI",
        timestamp: "Error"
      }));
      toast({
        title: t('toastQueryErrorTitle'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleToggleRecording = () => {
    if (hasMicPermission === false) {
      toast({ 
        title: t('micAccessDeniedTitle'), 
        description: t('micPermissionOrSupportError'), 
        variant: "destructive" 
      });
      return;
    }
    if (hasMicPermission === null) {
      toast({ 
        title: t('micAccessDeniedTitle'), 
        description: t('micAccessDeniedDescription'), // Or a "please wait for permission"
        variant: "default" 
      });
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    if (isRecording) {
      speechRecognitionRef.current?.stop();
      setIsRecording(false); 
    } else {
      const recognition = new SpeechRecognitionAPI();
      
      let speechLang = locale;
      if (locale === 'ua') speechLang = 'uk-UA';
      else if (locale === 'en') speechLang = 'en-US';
      else if (locale === 'es') speechLang = 'es-ES';
      recognition.lang = speechLang;
      
      recognition.interimResults = true;
      recognition.continuous = false; 

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const fullTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setQuery(fullTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        toast({ title: t('speechRecognitionErrorTitle'), description: event.error, variant: "destructive" });
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        toast({ title: t('speechRecognitionErrorTitle'), description: (e as Error).message, variant: "destructive" });
        setIsRecording(false);
      }
    }
  };


  return (
    <div className="container mx-auto py-8 h-[calc(100vh-var(--header-height,8rem))] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">
          {selectedFile ? t('chattingWith', {fileName: selectedFile.name}) : t('description')}
        </p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6 flex-grow min-h-0">
        <div className="md:col-span-1 flex-shrink-0 md:h-full">
          <Card className="shadow-md flex flex-col md:sticky md:top-24 h-auto max-h-[40vh] md:h-full md:max-h-none">
            <CardHeader>
              <CardTitle>{t('selectFileTitle')}</CardTitle>
              <CardDescription>{t('selectFileDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              <FileList 
                onFileSelect={setSelectedFileId} 
                selectedFileId={selectedFileId} 
                showActions={false}
                maxHeight="max-h-full" 
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 flex flex-col flex-grow min-h-0">
          <Card className="shadow-lg flex-grow flex flex-col h-full bg-card"> {/* Ensured card uses card background */}
            <CardHeader>
              <CardTitle>
                {selectedFile ? t('chatWithFile', {fileName: selectedFile.name}) : t('generalChatTitle')}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea ref={scrollAreaRef} className="h-full p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                    <BrainCircuit size={48} className="mb-2"/>
                    {selectedFile ? (
                      <p>{t('startConversationWithFile', {fileName: selectedFile.name})}</p>
                    ) : (
                      <p>{t('startGeneralConversation')}</p>
                    )}
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex mb-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn("flex items-end max-w-[75%]", msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      <Avatar className={cn("h-8 w-8", msg.role === 'user' ? 'ml-2' : 'mr-2')}>
                        <AvatarImage src={msg.role === 'ai' ? undefined : msg.avatar} />
                        <AvatarFallback className={cn(
                          msg.role === 'ai' 
                            ? 'bg-primary text-primary-foreground dark:bg-muted dark:text-foreground' 
                            : 'bg-secondary text-secondary-foreground'
                        )}>
                          {msg.role === 'ai' ? <BrainCircuit size={18}/> : <User size={18}/>}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={cn(
                          "p-3 rounded-lg shadow-md", 
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground dark:bg-secondary dark:text-secondary-foreground rounded-br-none' 
                            : 'bg-muted dark:bg-muted dark:text-foreground rounded-bl-none',
                        )}
                      >
                        {msg.isLoading ? (
                          <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-current rounded-full animate-bounce"></span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                        {msg.timestamp && !msg.isLoading && <p className="text-xs mt-1 opacity-70">{msg.name === "Gnosis.AI" ? msg.timestamp : ""}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('errorTitle')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="p-2 sm:p-4 border-t dark:bg-muted flex flex-col items-center"> {/* Adjusted footer bg for dark mode */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="flex items-center w-full space-x-2"
              >
                <Textarea
                  placeholder={selectedFile ? t('typeYourMessagePlaceholder') : t('typeYourGeneralMessagePlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  className="flex-grow resize-none min-h-[40px] max-h-[120px] text-sm sm:text-base"
                  disabled={isLoading}
                  aria-label={t('queryPlaceholder')}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-primary" 
                  onClick={handleToggleRecording}
                  disabled={hasMicPermission === false || (isLoading && !isRecording) || hasMicPermission === null}
                  aria-label={isRecording ? t('stopVoiceInput') : t('voiceInput')}
                >
                  {isRecording ? <StopCircle className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                  <span className="sr-only">{isRecording ? t('stopVoiceInput') : t('voiceInput')}</span>
                </Button>
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" disabled={isLoading || !query.trim()}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  <span className="sr-only">{t('sendMessage')}</span>
                </Button>
              </form>
              {hasMicPermission === false && (
                <p className="text-xs text-destructive text-center mt-1 px-2">{t('micPermissionOrSupportError')}</p>
              )}
              <div className="text-xs text-muted-foreground text-center mt-2 w-full">
                <ModelSelector selectedModelId={selectedModelId} onModelChange={setSelectedModelId} />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

