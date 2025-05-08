import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/contexts/app-providers"; // Import AppProviders
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Gnosis.AI",
  description: "Unlock insights from your data with the power of AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders> {/* AppProviders now wraps all children */}
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
