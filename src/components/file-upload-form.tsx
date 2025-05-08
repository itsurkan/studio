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
  const [pendingFiles, setPendingFiles] = useState<UploadableFile[]>([]);
  const { addFiles: addUploadedFilesToContext } = useFiles();
  const { toast } = useToast();
  const formId = useId();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (pendingFiles.length + acceptedFiles.length > MAX_FILES_PER_UPLOAD) {
        toast({
            title: "Upload Limit Exceeded",
            description: `You can only select up to ${MAX_FILES_PER_UPLOAD} files at a time.`,
            variant: "destructive",
        });
        return;
    }

    const newFiles: UploadableFile[] = acceptedFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`, // Simple unique ID
      file,
      status: "pending",
      progress: 0,
    }));
    setPendingFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES_PER_UPLOAD));

    fileRejections.forEach((rejection: any) => {
      rejection.errors.forEach((error: any) => {
        toast({
          title: `File Error: ${rejection.file.name}`,
          description: error.message,
          variant: "destructive",
        });
      });
    });
  }, [toast, pendingFiles.length]);

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
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "default" });
      return;
    }

    const filesToUpload = pendingFiles.filter(f => f.status === "pending");
    if (filesToUpload.length === 0) {
        toast({ title: "No new files to upload", description: "All selected files are already processed or being uploaded.", variant: "default" });
        return;
    }
    
    const appFiles: AppFile[] = [];

    for (const uploadableFile of filesToUpload) {
      setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: "uploading", progress: 0 } : f));
      
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, progress: i } : f));
        }

        const reader = new FileReader();
        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          // For MVP, read all as text. This is a simplification.
          // For PDFs, images, spreadsheets, content might not be human-readable text
          // but the AI flows expect string content.
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

        setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: "success", progress: 100 } : f));
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setPendingFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: "error", error: `Upload failed: ${errorMessage}` } : f));
        toast({
          title: `Upload Failed: ${uploadableFile.file.name}`,
          description: errorMessage,
          variant: "destructive",
        });
      }
    }

    if (appFiles.length > 0) {
      addUploadedFilesToContext(appFiles);
      toast({
        title: "Upload Successful",
        description: `${appFiles.length} file(s) processed.`,
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
    }
     // Clear successfully uploaded files from pending list or keep them with success status
     // For this version, let's keep them to show status, they will be cleared on "Clear All" or manual removal.
  };
  
  const clearAllFiles = () => {
    setPendingFiles([]);
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Upload Your Files</CardTitle>
        <CardDescription>Drag & drop files or click to select. Max 5MB per file, {MAX_FILES_PER_UPLOAD} files total.</CardDescription>
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
            <p className="text-primary font-semibold">Drop the files here ...</p>
          ) : (
            <p className="text-muted-foreground">Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>

        {pendingFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
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
                             <Button variant="ghost" size="icon" onClick={() => removePendingFile(pf.id)} aria-label={`Remove ${pf.file.name}`}>
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
                Clear All
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={pendingFiles.filter(f => f.status === 'pending').length === 0 || pendingFiles.filter(f => f.status === 'uploading').length > 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {pendingFiles.filter(f => f.status === 'uploading').length > 0 ? "Processing..." : "Process Selected Files"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
