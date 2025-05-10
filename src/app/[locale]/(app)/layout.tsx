import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { notFound } from 'next/navigation';
import { AppProviders } from "@/contexts/app-providers";
import { Toaster } from "@/components/ui/toaster";
import { locales } from "@/i18n";

export const metadata: Metadata = {
  title: "Gnosis.AI",
  description: "Unlock insights from your data with the power of AI.",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  const messages = useMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
