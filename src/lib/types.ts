
export interface AppFile {
  id: string;
  name: string;
  type: string; // Mime type like 'text/plain', 'application/pdf'
  size: number; // in bytes
  content: string; // Text content of the file
  lastModified: number; // Timestamp
  fileObject?: File; // Original browser File object, optional
}

export type OutputFormat = "bullets" | "paragraphs";
