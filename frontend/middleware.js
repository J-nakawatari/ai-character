import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages } from './next-i18next.config';

acceptLanguage.languages(languages || ['ja', 'en']);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

const cookieName = 'i18next';

export function middleware(req) {
  let lng;
  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName).value);
  }
  if (!lng) {
    lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  }
  if (!lng) {
    lng = fallbackLng;
  }

  if (
    !languages?.includes(lng) &&
    !req.nextUrl.pathname.startsWith('/_next') &&
    !req.nextUrl.pathname.includes('/api/')
  ) {
    return NextResponse.redirect(
      new URL(`/${fallbackLng}${req.nextUrl.pathname}`, req.url)
    );
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'));
    const lngInReferer = languages?.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    );
    const response = NextResponse.next();
    if (lngInReferer) {
      response.cookies.set(cookieName, lngInReferer);
    }
    return response;
  }

  return NextResponse.next();
}
