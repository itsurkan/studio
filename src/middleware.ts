
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale,

  // Always use a locale prefix (e.g. /en/about, /es/about)
  // 'as-needed' can be used if you want the default locale to not have a prefix
  localePrefix: 'always', 
});
 
export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized (e.g. /api, /_next, static files)
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en|es|uk)/:path*', // Updated to include 'uk'

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/uk/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
