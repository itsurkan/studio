
"use client";

import type { ReactNode } from 'react';
import { FileProvider } from './file-provider';
import { AuthProvider } from './auth-provider'; // Import AuthProvider
import { ThemeProvider } from './theme-provider'; // Import ThemeProvider

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider> {/* AuthProvider wraps FileProvider */}
      <ThemeProvider> {/* ThemeProvider wraps other app-specific providers */}
        <FileProvider>
          {children}
        </FileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
