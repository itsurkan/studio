
"use client";

import { useFiles } from "@/contexts/file-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, FileText, Download, Trash2 } from "lucide-react";
import { FileIcon } from "./file-icon";
import { format } from 'date-fns';
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";


interface FileListProps {
  onFileSelect?: (fileId: string) => void;
  selectedFileId?: string | null;
  showActions?: boolean;
  maxHeight?: string;
  files?: AppFile[]; // Allow passing files directly for search results
}

export function FileList({ 
  onFileSelect, 
  selectedFileId, 
  showActions = true, 
  maxHeight = "h-96",
  files: propFiles // Rename to avoid conflict with context files
}: FileListProps) {
  const t = useTranslations('FileList');
  const { files: contextFiles, removeFile } = useFiles();

  // Use propFiles if provided, otherwise use files from context
  const filesToDisplay = propFiles || contextFiles;


  if (filesToDisplay.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t('myFiles')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{t('noFilesUploaded')}</p>
            <p className="text-sm text-muted-foreground">{t('uploadToStart')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = (fileId: string) => {
    const file = filesToDisplay.find(f => f.id === fileId);
    if (file && file.fileObject) {
      const blob = new Blob([file.content], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>{t('myFiles')}</CardTitle>
        <CardDescription>{t('manageDocuments')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn("w-full", maxHeight)}>
          <ul className="space-y-3">
            {filesToDisplay.map((file) => (
              <li
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer
                  ${selectedFileId === file.id ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary hover:bg-secondary/80"}`}
                onClick={() => onFileSelect?.(file.id)}
                onKeyDown={(e) => e.key === 'Enter' && onFileSelect?.(file.id)}
                tabIndex={onFileSelect ? 0 : -1}
                role={onFileSelect ? "button" : undefined}
                aria-pressed={selectedFileId === file.id}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon fileType={file.type} className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-semibold truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &bull; {format(new Date(file.lastModified), "PPp")}
                    </p>
                  </div>
                </div>
                {showActions && (
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDownload(file.id); }} aria-label={t('downloadFile', {fileName: file.name})}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} aria-label={t('removeFile', {fileName: file.name})}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
