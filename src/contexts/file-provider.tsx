"use client";

import type { AppFile } from "@/lib/types";
import type React from "react";
import { createContext, useContext, useState, useCallback } from "react";

interface FileContextType {
  files: AppFile[];
  addFile: (file: AppFile) => void;
  addFiles: (newFiles: AppFile[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  updateFileIndexingStatus: (
    fileId: string,
    status: AppFile['indexingStatus'],
    error?: string
  ) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<AppFile[]>([]);

  const addFile = useCallback((file: AppFile) => {
    setFiles((prevFiles) => [...prevFiles, file]);
  }, []);

  const addFiles = useCallback((newFiles: AppFile[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const updateFileIndexingStatus = useCallback(
    (fileId: string, status: AppFile['indexingStatus'], error?: string) => {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId
            ? { ...file, indexingStatus: status, indexingError: error }
            : file
        )
      );
    },
    []
  );

  return (
    <FileContext.Provider value={{ files, addFile, addFiles, removeFile, clearFiles, updateFileIndexingStatus }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}
