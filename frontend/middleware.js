import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja'
});

export const config = {
  matcher: [
    // /admin 配下は除外
    '/((?!api|_next|.*\\..*|admin).*)'
  ]
};
