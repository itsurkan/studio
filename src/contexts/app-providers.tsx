"use client";

import type { ReactNode } from 'react';
import { FileProvider } from './file-provider';
// Import other providers here if needed

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <FileProvider>
      {/* Wrap with other providers if you add them */}
      {children}
    </FileProvider>
  );
}
