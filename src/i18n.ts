
import {getRequestConfig, GetRequestConfigParams} from 'next-intl/server';
import { headers } from 'next/headers';
 
export const locales = ['en', 'es', 'ua'];
export const defaultLocale = 'ua';

export default getRequestConfig(async ({locale}: GetRequestConfigParams) => {
  // Validate that the incoming `locale` parameter is a subset of the defined locales.
  let activeLocale = locale;
  if (!locales.includes(activeLocale)) {
  }
 
  const userAgent = (await headers()).get('user-agent');
  console.log('User Agent:', userAgent);

  const messages = (await import(`./messages/${activeLocale}.json`)).default;
  return {
    messages
  };
});

