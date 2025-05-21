module.exports = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    localeDetection: false,
  },
  fallbackLng: {
    default: ['ja'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  defaultNS: 'common',
  detection: {
    order: ['localStorage', 'cookie', 'navigator'],
    caches: ['localStorage', 'cookie'],
  },
  react: {
    useSuspense: false,
  },
};
