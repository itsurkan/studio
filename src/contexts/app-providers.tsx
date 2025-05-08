
"use client";

import type { ReactNode } from 'react';
import { FileProvider } from './file-provider';
import { AuthProvider } from './auth-provider'; // Import AuthProvider

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider> {/* AuthProvider wraps FileProvider */}
      <FileProvider>
        {children}
      </FileProvider>
    </AuthProvider>
  );
}
