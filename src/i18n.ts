
import {getRequestConfig} from 'next-intl/server';
 
export const locales = ['en', 'es', 'ua'];
export const defaultLocale = 'ua';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a subset of the defined locales.
  let activeLocale = locale;
  if (!locales.includes(locale as any)) {
    // Handle invalid locales, e.g., by returning messages for the default locale
    // or by throwing an error / using notFound() from next/navigation.
    // For simplicity, we'll load default messages here.
    // The middleware should ideally prevent invalid locales from reaching this point.
    console.warn(`Invalid locale "${locale}" requested. Falling back to default locale "${defaultLocale}".`);
    activeLocale = defaultLocale;
  }
 
  const messages = (await import(`./messages/${activeLocale}.json`)).default;
  return {
    locale: activeLocale, // Ensure locale is returned
    messages
  };
});

