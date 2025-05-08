
import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import {locales} from './i18n';
 
// Define pathnames for each locale if they differ.
// For this example, we assume pathnames are the same across locales.
// If you had /about (EN) and /acerca-de (ES), you would define them here.
export const pathnames = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/search': '/search',
  '/rag': '/rag',
  '/auth/login': '/auth/login',
  '/settings': '/settings'
} as const;

export type AppPathnames = keyof typeof pathnames;
 
export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, pathnames, localePrefix: 'always'});
