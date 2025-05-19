
import {getRequestConfig, type GetRequestConfigParams} from 'next-intl/server';
// import { headers } from 'next/headers'; // Removed

export const locales = ['en', 'es', 'ua'];
export const defaultLocale = 'ua';

export default getRequestConfig(async ({locale}: GetRequestConfigParams) => {
  // The `locale` parameter is guaranteed by the `next-intl` middleware
  // to be one of your configured `locales`.

  // Removed User Agent logging as it uses `headers()` which is problematic here.
  // const userAgent = (await headers()).get('user-agent');
  // console.log('User Agent:', userAgent);

  const messages = (await import(`./messages/${locale}.json`)).default;
  return {
    messages,
    locale // Ensure locale is returned as per next-intl requirements
  };
});

