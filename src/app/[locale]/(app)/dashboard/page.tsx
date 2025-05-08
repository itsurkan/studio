
"use client"; // Required because we use hooks like useTranslations

import { FileUploadForm } from "@/components/file-upload-form";
import { FileList } from "@/components/file-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('DashboardPage');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('welcome')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
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
                {t('quickTipsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p dangerouslySetInnerHTML={{ __html: t.markup('tipUpload', { bold_text: (chunks) => `<strong>${chunks}</strong>` }) }} />
              <p dangerouslySetInnerHTML={{ __html: t.markup('tipSearch', { bold_text: (chunks) => `<strong>${chunks}</strong>` }) }} />
              <p dangerouslySetInnerHTML={{ __html: t.markup('tipAnalyze', { bold_text: (chunks) => `<strong>${chunks}</strong>` }) }} />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t('integrationsTitle')}</CardTitle>
              <CardDescription>{t('integrationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('integrationsComingSoon')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
