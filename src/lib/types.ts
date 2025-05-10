
export interface AppFile {
  id: string;
  name: string;
  type: string; // Mime type like 'text/plain', 'application/pdf'
  size: number; // in bytes
  content: string; // Text content of the file
  lastModified: number; // Timestamp
  fileObject?: File; // Original browser File object, optional
  indexingStatus?: 'pending' | 'indexing' | 'indexed' | 'error'; // Status of backend indexing
  indexingError?: string; // Optional error message if indexing failed
}

export type OutputFormat = "bullets" | "paragraphs";
