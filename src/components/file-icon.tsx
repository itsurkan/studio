import { FileText, FileSpreadsheet, FileImage, FileArchive, FileQuestion, FileCode2 } from "lucide-react";
import type { LucideProps } from "lucide-react";

interface FileIconProps extends LucideProps {
  fileType: string; // Mime type or simple type like 'pdf'
}

export function FileIcon({ fileType, ...props }: FileIconProps) {
  const lowerType = fileType.toLowerCase();

  if (lowerType.includes("pdf")) {
    return <FileArchive {...props} />;
  }
  if (lowerType.startsWith("image/")) {
    return <FileImage {...props} />;
  }
  if (lowerType.includes("spreadsheet") || lowerType.includes("excel") || lowerType.includes("csv")) {
    return <FileSpreadsheet {...props} />;
  }
  if (lowerType.startsWith("text/")) {
     if (lowerType.includes("json") || lowerType.includes("javascript") || lowerType.includes("typescript") || lowerType.includes("python") || lowerType.includes("xml") || lowerType.includes("html") || lowerType.includes("css")) {
        return <FileCode2 {...props} />;
     }
    return <FileText {...props} />;
  }
  
  return <FileQuestion {...props} />;
}
