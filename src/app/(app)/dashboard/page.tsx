
import { FileUploadForm } from "@/components/file-upload-form";
import { FileList } from "@/components/file-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lightbulb } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Gnosis.AI</h1>
        <p className="text-muted-foreground">Upload, search, and analyze your documents with ease.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <FileUploadForm />
          <FileList />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong>Upload:</strong> Drag & drop or click to upload text, PDFs, spreadsheets, and images.</p>
              <p><strong>Search:</strong> Use the Semantic Search page to find information within your documents using natural language.</p>
              <p><strong>Analyze:</strong> Ask questions or request summaries on the RAG page to get AI-powered insights.</p>
            </CardContent>
          </Card>
          
          {/* Placeholder for Zapier integration info */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect with Google Drive & Dropbox</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Import files directly from your cloud storage. (Coming soon via Zapier)
              </p>
               {/* <Button variant="outline" className="mt-4 w-full" disabled>Configure Integrations</Button> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
