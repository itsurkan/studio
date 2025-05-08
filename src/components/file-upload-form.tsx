
"use client";

import { useState, useCallback, useId } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, X, CheckCircle2 } from "lucide-react";
import type { AppFile } from "@/lib/types";
import { useFiles } from "@/contexts/file-provider";
import { FileIcon } from "./file-icon";
import { useTranslations } from "next-intl";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_UPLOAD = 10;

interface UploadableFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function FileUploadForm() {
  const t = useTranslations('FileUploadForm');
  const [pendingFiles, setPendingFiles] = useState<UploadableFile[]>([]);
  const { addFiles: addUploadedFilesToContext } = useFiles();
  const { toast } = useToast();
  const formId = useId();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (pendingFiles.length + acceptedFiles.length > MAX_FILES_PER_UPLOAD) {
        toast({
            title: t('uploadLimitExceeded'),
            description: t('uploadLimitExceededDescription', {maxFiles: MAX_FILES_PER_UPLOAD}),
            variant: "destructive",
        });
        return;
    }

    const newFiles: UploadableFile[] = acceptedFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      status: "pending",
      progress: 0,
    }));
    setPendingFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES_PER_UPLOAD));

    fileRejections.forEach((rejection: any) => {
      rejection.errors.forEach((error: any) => {
        toast({
          title: t('fileError', {fileName: rejection.file.name}),
          description: error.message,
          variant: "destructive",
        });
      });
    });
  }, [toast, pendingFiles.length, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt", ".md"],
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES_PER_UPLOAD - pendingFiles.length, 
    disabled: pendingFiles.length >= MAX_FILES_PER_UPLOAD,
  });

  const removePendingFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      toast({ title: t('noFilesSelected'), description: t('noFilesSelectedDescription'), variant: "default" });
      return;
    }

    const filesToUpload = pendingFiles.filter(f => f.status === "pending");
    if (filesToUpload.length === 0) {
        toast({ title: t('noNewFilesToUpload'), description: t('noNewFilesToUploadDescription'), variant: "default" });
        return;
    }
    
    const appFiles: AppFile[] = [];

    for (const uploadableFile of filesToUpload) {
      setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: t('statusUploading') as "uploading", progress: 0 } : f));
      
      try {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, progress: i } : f));
        }

        const reader = new FileReader();
        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsText(uploadableFile.file); 
        });
        
        const appFile: AppFile = {
          id: uploadableFile.id,
          name: uploadableFile.file.name,
          type: uploadableFile.file.type,
          size: uploadableFile.file.size,
          content: fileContent, 
          lastModified: uploadableFile.file.lastModified,
          fileObject: uploadableFile.file,
        };
        appFiles.push(appFile);

        setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: t('statusSuccess') as "success", progress: 100 } : f));
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: t('statusError') as "error", error: `${t('uploadFailed', {fileName: uploadableFile.file.name})}: ${errorMessage}` } : f));
        toast({
          title: t('uploadFailed', {fileName: uploadableFile.file.name}),
          description: errorMessage,
          variant: "destructive",
        });
      }
    }

    if (appFiles.length > 0) {
      addUploadedFilesToContext(appFiles);
      toast({
        title: t('uploadSuccessful'),
        description: t('uploadSuccessfulDescription', {count: appFiles.length}),
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
    }
  };
  
  const clearAllFiles = () => {
    setPendingFiles([]);
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description', {maxFiles: MAX_FILES_PER_UPLOAD})}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          aria-labelledby={`${formId}-title`}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
            ${pendingFiles.length >= MAX_FILES_PER_UPLOAD ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} id={`${formId}-input`} disabled={pendingFiles.length >= MAX_FILES_PER_UPLOAD} />
          <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          {isDragActive ? (
            <p className="text-primary font-semibold">{t('dropzoneActive')}</p>
          ) : (
            <p className="text-muted-foreground">{t('dropzoneDefault')}</p>
          )}
        </div>

        {pendingFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">{t('selectedFiles')}</h3>
            <ScrollArea className="h-60 w-full pr-4">
              <ul className="space-y-3">
                {pendingFiles.map(pf => (
                  <li key={pf.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FileIcon fileType={pf.file.type} className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="flex-grow overflow-hidden">
                        <p className="text-sm font-medium truncate" title={pf.file.name}>{pf.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(pf.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {pf.status === "uploading" && <Progress value={pf.progress} className="h-1.5 mt-1" />}
                        {pf.status === "error" && <p className="text-xs text-destructive mt-1">{pf.error}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {pf.status === "success" && <CheckCircle2 className="w-5 h-5 text-accent" />}
                        {(pf.status === "pending" || pf.status === "error") && (
                             <Button variant="ghost" size="icon" onClick={() => removePendingFile(pf.id)} aria-label={t('removeFile', {fileName: pf.file.name})}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={clearAllFiles} disabled={pendingFiles.filter(f => f.status === 'uploading').length > 0}>
                {t('clearAll')}
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={pendingFiles.filter(f => f.status === 'pending').length === 0 || pendingFiles.filter(f => f.status === 'uploading').length > 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {pendingFiles.filter(f => f.status === 'uploading').length > 0 ? t('processing') : t('processSelectedFiles')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
