
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark'; // The actual theme being applied

interface ThemeProviderContextType {
  theme: Theme; // User's preference
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme; // Actual theme applied (light or dark)
}

const ThemeContext = createContext<ThemeProviderContextType | undefined>(undefined);

const STORAGE_KEY = 'gnosis-ai-theme-preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreference] = useState<Theme>('system');
  const [currentResolvedTheme, setCurrentResolvedTheme] = useState<ResolvedTheme>('light'); // Default, will be adjusted

  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedTheme = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
    setThemePreference(storedTheme);

    const applyThemeClass = (effectiveTheme: ResolvedTheme) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      setCurrentResolvedTheme(effectiveTheme);
    };
    
    let initialResolved: ResolvedTheme;
    if (storedTheme === 'system') {
        initialResolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
        initialResolved = storedTheme;
    }
    applyThemeClass(initialResolved);


    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Check current preference from localStorage again, as state might not be updated yet if changed rapidly.
      const currentPreference = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
      if (currentPreference === 'system') {
        applyThemeClass(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemePreference(newTheme); // Update the preference state

    // Immediately apply the new theme
    const root = document.documentElement;
    let activeTheme: ResolvedTheme;
    if (newTheme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      activeTheme = newTheme;
    }
    root.classList.remove('light', 'dark');
    root.classList.add(activeTheme);
    setCurrentResolvedTheme(activeTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: themePreference, setTheme, resolvedTheme: currentResolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
