import type { Metadata } from "next";
// Removed Geist font imports as they were related to a previous hydration issue and are not present in the final user code state for this step.
import "./globals.css";
// import { AppProviders } from "@/contexts/app-providers"; // AppProviders will be moved
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
      {/* Body classes related to fonts were removed in a previous step to address hydration. */}
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
