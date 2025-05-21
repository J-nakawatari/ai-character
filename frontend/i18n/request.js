import { getRequestConfig } from 'next-intl/server';
import { locales } from '../app/i18n-config';

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
