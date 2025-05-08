
"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Cog } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Cog className="w-8 h-8 mr-3 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('languageSettingsTitle')}</CardTitle>
            <CardDescription>{t('languageSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start space-y-4">
            <LanguageSwitcher />
            <p className="text-sm text-muted-foreground">
              {t('currentLanguageHint')}
            </p>
          </CardContent>
        </Card>
        
        {/* Placeholder for future settings */}
        <Card className="shadow-md opacity-50">
          <CardHeader>
            <CardTitle>{t('profileSettingsTitle')}</CardTitle>
            <CardDescription>{t('profileSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md opacity-50">
          <CardHeader>
            <CardTitle>{t('notificationSettingsTitle')}</CardTitle>
            <CardDescription>{t('notificationSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
