
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale,

  // Always use a locale prefix (e.g. /en/about, /es/about)
  localePrefix: 'always', 
});
 
export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js static files
  // - Next.js image optimization files
  // - _vercel specific paths (retained from original)
  // - Files with an extension (e.g., favicon.ico, sitemap.xml)
  matcher: ['/((?!api|_next/static|_next/image|_vercel|.*\\..*).*)']
};

