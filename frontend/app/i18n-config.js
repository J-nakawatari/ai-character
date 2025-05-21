export const defaultLocale = 'ja';
export const locales = ['ja', 'en'];

export function getLocaleFromPath(pathname) {
  const segments = pathname.split('/');
  const locale = segments[1];
  return locales.includes(locale) ? locale : defaultLocale;
}

export function removeLocaleFromPath(pathname, locale) {
  if (pathname === '/' + locale) return '/';
  return pathname.replace(new RegExp(`^/${locale}`), '') || '/';
}

export function addLocaleToPath(pathname, locale) {
  if (locale === defaultLocale) return pathname;
  return `/${locale}${pathname === '/' ? '' : pathname}`;
}
